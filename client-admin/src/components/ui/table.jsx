import React from 'react';

const Table = ({ children, className = '', ...props }) => {
  const classes = `w-full caption-bottom text-sm ${className}`;
  
  return (
    <div className="relative w-full overflow-auto">
      <table className={classes} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  const classes = `[&_tr]:border-b ${className}`;
  
  return (
    <thead className={classes} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  const classes = `[&_tr:last-child]:border-0 ${className}`;
  
  return (
    <tbody className={classes} {...props}>
      {children}
    </tbody>
  );
};

const TableFooter = ({ children, className = '', ...props }) => {
  const classes = `border-t bg-gray-50/50 font-medium [&>tr]:last:border-b-0 ${className}`;
  
  return (
    <tfoot className={classes} {...props}>
      {children}
    </tfoot>
  );
};

const TableRow = ({ children, className = '', ...props }) => {
  const classes = `border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50 ${className}`;
  
  return (
    <tr className={classes} {...props}>
      {children}
    </tr>
  );
};

const TableHead = ({ children, className = '', ...props }) => {
  const classes = `h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`;
  
  return (
    <th className={classes} {...props}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '', ...props }) => {
  const classes = `p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`;
  
  return (
    <td className={classes} {...props}>
      {children}
    </td>
  );
};

const TableCaption = ({ children, className = '', ...props }) => {
  const classes = `mt-4 text-sm text-gray-500 ${className}`;
  
  return (
    <caption className={classes} {...props}>
      {children}
    </caption>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};