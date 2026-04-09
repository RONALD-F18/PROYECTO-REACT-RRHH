import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ChatFab from '../modulos/chat/componentes/ChatFab';
import ChatModal from '../modulos/chat/componentes/ChatModal';

const ChatAsistenteContext = createContext(null);

export function ChatAsistenteProvider({ children }) {
  const [abierto, setAbierto] = useState(false);
  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);
  const valor = useMemo(() => ({ abierto, abrir, cerrar }), [abierto, abrir, cerrar]);

  return (
    <ChatAsistenteContext.Provider value={valor}>
      {children}
      <ChatFab onClick={abrir} />
      <ChatModal abierto={abierto} cerrar={cerrar} />
    </ChatAsistenteContext.Provider>
  );
}

export function useChatAsistente() {
  const ctx = useContext(ChatAsistenteContext);
  if (!ctx) {
    return null;
  }
  return ctx;
}
