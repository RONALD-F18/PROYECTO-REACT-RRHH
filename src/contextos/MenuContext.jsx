import { createContext, useContext, useState } from 'react';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu debe usarse dentro de MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <MenuContext.Provider value={{ menuAbierto, toggleMenu, cerrarMenu }}>
      {children}
    </MenuContext.Provider>
  );
};


