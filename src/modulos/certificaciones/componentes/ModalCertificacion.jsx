import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import FormularioPasos from '../../../componentes/comunes/FormularioPasos';
import { buscarEmpleadoPorDocumento } from '../../../services/empleados';
import { certificacionApiAFormulario } from '../../../services/certificaciones';
import { buildCertificacionPayload } from '../utils/certificacionesPayload';
import {
  estadoInicialCertificacion,
  pasoConErroresCertificacion,
  validarCampoCertificacion,
  validarDocumentoCertificacion,
  validarFormularioCertificacion,
} from '../utils/certificacionesValidation';
import { afiliacionVigentePorEmpleado, salarioNumericoDesdeContrato } from '../utils/certificacionesAfiliacion';
import CertStepEmpleado from './CertStepEmpleado';
import CertificationTypeStep from './CertificationTypeStep';
import DetailsStep from './DetailsStep';
import EmissionStep from './EmissionStep';

function ModalCertificacion({ mostrar, cerrar, catalogos, registroEditar, enviando, onGuardar }) {
  const [pasoActual, setPasoActual] = useState(0);
  const [form, setForm] = useState(estadoInicialCertificacion());
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!mostrar) return;
    setPasoActual(0);
    setErrores({});
    if (registroEditar) {
      const base = certificacionApiAFormulario(registroEditar);
      const emp = (catalogos.empleados ?? []).find((e) => String(e.cod_empleado ?? e.id) === String(base.cod_empleado));
      if (emp?.doc_iden) base.documento_consulta = String(emp.doc_iden).trim();
      setForm(base);
    } else {
      const base = estadoInicialCertificacion();
      const primeraEmpresa = catalogos.empresas?.[0];
      if (primeraEmpresa?.id_empresa != null) base.id_empresa = String(primeraEmpresa.id_empresa);
      setForm(base);
    }
  }, [mostrar, registroEditar, catalogos.empresas, catalogos.empleados]);

  const contratosEmpleado = useMemo(() => {
    const ce = String(form.cod_empleado ?? '').trim();
    if (!ce) return [];
    return (catalogos.contratos ?? []).filter((c) => String(c.cod_empleado ?? c.empleado?.cod_empleado ?? '') === ce);
  }, [catalogos.contratos, form.cod_empleado]);

  const contratoSeleccionado = useMemo(() => {
    if (!form.cod_contrato) return null;
    return contratosEmpleado.find((c) => String(c.cod_contrato) === String(form.cod_contrato)) ?? null;
  }, [contratosEmpleado, form.cod_contrato]);

  const afiliacionVigente = useMemo(
    () => afiliacionVigentePorEmpleado(catalogos.afiliaciones ?? [], form.cod_empleado),
    [catalogos.afiliaciones, form.cod_empleado],
  );

  useEffect(() => {
    if (contratosEmpleado.length !== 1) return;
    const solo = contratosEmpleado[0];
    setForm((prev) => {
      if (String(prev.cod_contrato) === String(solo.cod_contrato)) return prev;
      return { ...prev, cod_contrato: String(solo.cod_contrato) };
    });
  }, [contratosEmpleado]);

  useEffect(() => {
    if (!form.incluye_salario) {
      setForm((prev) => (prev.salario_certificado === '' ? prev : { ...prev, salario_certificado: '' }));
      return;
    }
    const n = salarioNumericoDesdeContrato(contratoSeleccionado);
    const str = n != null ? String(n) : '';
    setForm((prev) => (prev.salario_certificado === str ? prev : { ...prev, salario_certificado: str }));
  }, [form.incluye_salario, contratoSeleccionado]);

  const setCampo = (campo, valor) => {
    setForm((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === 'tipo_certificacion' && String(valor).toUpperCase() !== 'AFILIACIONES') {
        next.cod_eps = '';
        next.cod_arl = '';
        next.cod_pension = '';
        next.cod_caja = '';
        next.cod_cesantias = '';
      }
      if (campo === 'incluye_salario' && !valor) next.salario_certificado = '';
      return next;
    });
    setErrores((prev) => ({
      ...prev,
      [campo]: validarCampoCertificacion(campo, valor, { ...form, [campo]: valor }),
    }));
  };

  const onEmpresaChange = (v) => setCampo('id_empresa', v);

  const onDocumentoChange = (raw) => {
    if (registroEditar) return;
    const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 12);
    setForm((prev) => ({
      ...prev,
      documento_consulta: digits,
      cod_empleado: '',
      cod_contrato: '',
    }));
    setErrores((prev) => ({
      ...prev,
      documento_consulta: digits ? validarDocumentoCertificacion(digits) : null,
      cod_empleado: null,
      cod_contrato: null,
    }));
  };

  const resolverEmpleadoPorDocumento = () => {
    const encontrado = buscarEmpleadoPorDocumento(catalogos.empleados ?? [], form.documento_consulta);
    setForm((prev) => {
      if (!encontrado) {
        return {
          ...prev,
          cod_empleado: '',
          cod_contrato: '',
        };
      }
      const ce = String(encontrado.cod_empleado ?? encontrado.id ?? '');
      const lista = (catalogos.contratos ?? []).filter((c) => String(c.cod_empleado ?? c.empleado?.cod_empleado) === ce);
      let codContrato = '';
      if (lista.length === 1) codContrato = String(lista[0].cod_contrato);
      return {
        ...prev,
        cod_empleado: ce,
        cod_contrato: codContrato,
        documento_consulta: String(encontrado.doc_iden ?? prev.documento_consulta)
          .replace(/\D/g, '')
          .slice(0, 12),
      };
    });
    if (!encontrado) {
      setErrores((prev) => ({
        ...prev,
        cod_empleado: 'No se encontró un empleado con ese documento.',
      }));
    } else {
      setErrores((prev) => ({ ...prev, cod_empleado: null }));
    }
  };

  const onDocumentoBlur = () => {
    const err = validarDocumentoCertificacion(form.documento_consulta);
    if (err) {
      setErrores((prev) => ({ ...prev, documento_consulta: err }));
      return;
    }
    resolverEmpleadoPorDocumento();
  };

  const onContratoManual = (v) => setCampo('cod_contrato', v);

  const validarAntesDeSiguiente = (idx) => {
    const porPaso = [
      ['id_empresa', 'documento_consulta', 'cod_empleado'],
      ['tipo_certificacion'],
      ['salario_certificado'],
      ['fecha_emision', 'ciudad_emision', 'descripcion'],
    ];
    const campos = porPaso[idx] ?? [];
    const nuevos = {};
    const formCtx = { ...form, _contratosDelEmpleadoCount: contratosEmpleado.length };
    for (const c of campos) {
      const e =
        c === 'documento_consulta'
          ? validarDocumentoCertificacion(form.documento_consulta)
          : validarCampoCertificacion(c, form[c], formCtx);
      if (e) nuevos[c] = e;
    }
    if (idx === 0 && contratosEmpleado.length > 1 && !String(form.cod_contrato || '').trim()) {
      nuevos.cod_contrato = 'Seleccione el contrato del empleado.';
    }
    if (idx === 2 && form.incluye_salario) {
      const e = validarCampoCertificacion('salario_certificado', form.salario_certificado, form);
      if (e) nuevos.salario_certificado = e;
    }
    setErrores((prev) => ({ ...prev, ...nuevos }));
    return Object.keys(nuevos).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    const erroresForm = validarFormularioCertificacion(form, { contratosDelEmpleadoCount: contratosEmpleado.length });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      setPasoActual(pasoConErroresCertificacion(erroresForm));
      return;
    }
    await onGuardar(buildCertificacionPayload(form));
  };

  if (!mostrar) return null;

  return (
    <Modal mostrar={mostrar} cerrar={cerrar} titulo={registroEditar ? 'Editar Certificación' : 'Nueva Certificación'}>
      <form onSubmit={submit} className="cert-form">
        <FormularioPasos
          pasos={[
            { numero: 1, titulo: 'Empleado', color: 'morado' },
            { numero: 2, titulo: 'Tipo', color: 'azul' },
            { numero: 3, titulo: 'Detalles', color: 'verde' },
            { numero: 4, titulo: 'Emision', color: 'rosa' },
          ]}
          pasoActual={pasoActual}
          setPasoActual={setPasoActual}
          onCancelar={cerrar}
          textoGuardar={registroEditar ? 'Actualizar certificacion' : 'Generar certificacion'}
          enviando={enviando}
          validarAntesDeSiguiente={validarAntesDeSiguiente}
        >
          {pasoActual === 0 ? (
            <CertStepEmpleado
              empresas={catalogos.empresas}
              empleados={catalogos.empleados}
              contratosDelEmpleado={contratosEmpleado}
              form={form}
              errores={errores}
              onEmpresaChange={onEmpresaChange}
              onDocumentoChange={onDocumentoChange}
              onDocumentoBlur={onDocumentoBlur}
              onContratoManual={onContratoManual}
              documentoSoloLectura={Boolean(registroEditar)}
            />
          ) : null}

          {pasoActual === 1 ? (
            <CertificationTypeStep valor={form.tipo_certificacion} onChange={(v) => setCampo('tipo_certificacion', v)} />
          ) : null}

          {pasoActual === 2 ? (
            <DetailsStep
              form={form}
              onChange={setCampo}
              contratoSeleccionado={contratoSeleccionado}
              afiliacionVigente={afiliacionVigente}
            />
          ) : null}

          {pasoActual === 3 ? <EmissionStep form={form} onChange={setCampo} errores={errores} /> : null}
        </FormularioPasos>
      </form>
    </Modal>
  );
}

export default ModalCertificacion;
