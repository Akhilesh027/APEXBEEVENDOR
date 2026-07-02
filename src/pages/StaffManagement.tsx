import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { UserCheck, Plus, Trash2, Mail, ToggleLeft, ToggleRight, XCircle } from 'lucide-react';
import type { StaffMember } from '../types';

export const StaffManagement: React.FC = () => {
  const { staffList: contextStaffList, addStaff } = useVendor();
  const [localStaff, setLocalStaff] = useState<StaffMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Manager' | 'Cashier' | 'Stock Clerk' | 'Delivery Coordinator'>('Stock Clerk');

  // Synchronize local state with context staff list
  useEffect(() => {
    setLocalStaff(contextStaffList);
  }, [contextStaffList]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addStaff({
      name,
      email,
      role,
      status: 'Active',
      permissions: role === 'Manager' ? ['all'] : ['inventory_read']
    });

    setName('');
    setEmail('');
    setShowAddForm(false);
  };

  const togglePermission = (staffId: string, permission: string) => {
    setLocalStaff(prev =>
      prev.map(member => {
        if (member.id === staffId) {
          const hasPerm = member.permissions.includes(permission) || member.permissions.includes('all');
          let updatedPerms = [...member.permissions];
          
          if (member.permissions.includes('all')) {
            // If they are manager and have 'all', expand to separate permissions then toggle
            updatedPerms = ['inventory_read', 'inventory_write', 'wallet_read', 'wallet_write', 'orders_read', 'orders_write'];
          }

          if (hasPerm) {
            updatedPerms = updatedPerms.filter(p => p !== permission && p !== 'all');
          } else {
            updatedPerms.push(permission);
          }

          return { ...member, permissions: updatedPerms };
        }
        return member;
      })
    );
  };

  const toggleStatus = (staffId: string) => {
    setLocalStaff(prev =>
      prev.map(member =>
        member.id === staffId
          ? { ...member, status: member.status === 'Active' ? 'Inactive' : 'Active' }
          : member
      )
    );
  };

  const deleteStaff = (staffId: string) => {
    setLocalStaff(prev => prev.filter(m => m.id !== staffId));
  };

  const allAvailablePermissions = [
    { key: 'inventory_read', label: 'Inventory Read' },
    { key: 'inventory_write', label: 'Inventory Write' },
    { key: 'wallet_read', label: 'Wallet Read' },
    { key: 'wallet_write', label: 'Wallet Write' },
    { key: 'orders_read', label: 'Orders View' },
    { key: 'orders_write', label: 'Orders Process' }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Staff Permissions Management</h1>
          <p className="text-xs text-muted-foreground">Add operators, assign system roles, and configure dynamic access control permission sets.</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-primary text-white py-2 rounded-lg font-bold cursor-pointer text-xs self-start sm:self-auto"
        >
          {showAddForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? 'Cancel Form' : 'Add Staff Member'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add Staff Form */}
        {showAddForm && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="glass h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-bold">New Staff Registration</CardTitle>
                <CardDescription>Configure credentials and basic system roles</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStaff} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ramesh Pawar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Email Address *</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. ramesh@partner.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">Designation *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground focus:outline-none"
                    >
                      <option value="Manager">Manager (Full Access)</option>
                      <option value="Stock Clerk">Stock Clerk (Inventory Only)</option>
                      <option value="Cashier">Cashier (Billing/Refunds)</option>
                      <option value="Delivery Coordinator">Delivery Coordinator (Logistics)</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full mt-2 cursor-pointer bg-primary text-white font-bold h-9">
                    Add Operator
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Staff Table */}
        <div className={showAddForm ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <UserCheck className="h-4.5 w-4.5 text-primary" /> Active Operator Staff
              </CardTitle>
              <CardDescription>Grant specific modules read/write credentials</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Module Permissions Matrix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localStaff.map(member => (
                    <TableRow key={member.id} className="align-middle">
                      <TableCell className="font-bold text-foreground">
                        <div>{member.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {member.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[320px]">
                        <div className="flex flex-wrap gap-1.5">
                          {allAvailablePermissions.map(perm => {
                            const isAllowed = member.permissions.includes(perm.key) || member.permissions.includes('all');
                            return (
                              <button
                                key={perm.key}
                                onClick={() => togglePermission(member.id, perm.key)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  isAllowed
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50'
                                }`}
                              >
                                {perm.label}
                              </button>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleStatus(member.id)}
                          className="flex items-center gap-1 text-xs cursor-pointer focus:outline-none"
                        >
                          {member.status === 'Active' ? (
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <ToggleRight className="h-5 w-5" /> Active
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-semibold flex items-center gap-1">
                              <ToggleLeft className="h-5 w-5" /> Suspended
                            </span>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStaff(member.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer rounded-lg inline-flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
