import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

const Tabs = ({ value, onValueChange, children, className = '', ...props }) => {
  const [activeTab, setActiveTab] = useState(value);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '', ...props }) => {
  const classes = `
    inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = '', ...props }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  const classes = `
    inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium 
    ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
    cursor-pointer
    ${isActive 
      ? 'bg-white text-gray-950 shadow-sm' 
      : 'text-gray-600 hover:text-gray-900'
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} onClick={() => setActiveTab(value)} {...props}>
      {children}
    </div>
  );
};

const TabsContent = ({ value, children, className = '', ...props }) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;

  const classes = `
    mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-blue-500 focus-visible:ring-offset-2
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };