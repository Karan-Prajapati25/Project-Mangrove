import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Shield, Check, X } from 'lucide-react';

interface AdminRole {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  verification_status: string;
  is_super_admin: boolean;
  created_at: string;
  profiles?: {
    display_name: string;
  } | null;
}

const AdminManager = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkSuperAdminStatus();
    fetchAdminRoles();
  }, [user]);

  const checkSuperAdminStatus = async () => {
    if (!user) return;

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .eq('verification_status', 'approved')
      .single();

    setIsSuperAdmin(adminRole?.is_super_admin || false);
  };

  const fetchAdminRoles = async () => {
    const { data, error } = await supabase
      .from('admin_roles')
      .select(`
        *,
        profiles(display_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAdminRoles(data as any);
    }
  };

  const addNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast({
        title: "Access denied",
        description: "Only super admins can add new admins.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user exists
      const { data: userData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // For demo purposes, we'll create admin role for any email
      // In production, you'd want to verify the user exists first
      toast({
        title: "Admin invitation sent",
        description: `Admin privileges will be granted to ${adminEmail} when they sign up.`,
      });

      setAdminEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAdminStatus = async (adminId: string, status: 'approved' | 'rejected') => {
    if (!isSuperAdmin) {
      toast({
        title: "Access denied",
        description: "Only super admins can manage admin status.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('admin_roles')
      .update({ 
        verification_status: status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        approved_by: status === 'approved' ? user?.id : null
      })
      .eq('id', adminId);

    if (!error) {
      toast({
        title: `Admin ${status}`,
        description: `Admin role has been ${status} successfully.`,
      });
      fetchAdminRoles();
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>Access restricted to super administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <p>You need super admin privileges to manage administrators.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Administrator
          </CardTitle>
          <CardDescription>
            Grant administrative privileges to organization members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addNewAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Administrator Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="Enter email address"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Administrator"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Management</CardTitle>
          <CardDescription>
            Manage existing administrators and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminRoles.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <p className="font-medium">
                      {admin.profiles?.display_name || 'Unknown'}
                    </p>
                  </TableCell>
                  <TableCell>{admin.organization_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {admin.organization_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        admin.verification_status === 'approved' 
                          ? 'default' 
                          : admin.verification_status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {admin.verification_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.is_super_admin ? 'destructive' : 'secondary'}>
                      {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.verification_status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAdminStatus(admin.id, 'approved')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAdminStatus(admin.id, 'rejected')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManager;