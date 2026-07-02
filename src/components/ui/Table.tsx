import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ children, className = '', ...props }) => (
  <div className="w-full overflow-auto no-scrollbar border border-border bg-card rounded-xl">
    <table className={`w-full caption-bottom text-sm border-collapse text-left ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <thead className={`bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-border/60 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <tfoot className={`bg-muted/50 font-medium ${className}`} {...props}>
    {children}
  </tfoot>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-muted/30 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <th className={`h-12 px-4 text-left align-middle font-semibold text-muted-foreground ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <td className={`p-4 align-middle text-foreground ${className}`} {...props}>
    {children}
  </td>
);
