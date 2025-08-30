import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminService } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  BarChart3, 
  Search,
  Edit,
  Trash2,
  Crown,
  UserCheck,
  UserX
} from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  display_name: string;
  country: string;
  points: number;
  rank: number | null;
  created_at: string;
  is_admin: boolean;
  admin_roles?: {
    role_type: string;
    verification_status: string;
  }[];
  coins?: {
    balance: number;
  }[];
}

interface CreateUserData {
  email: string;
  password: string;
  display_name: string;
  country: string;
  is_admin: boolean;
  role_type: string;
}

interface CreateAdminData {
  user_id: string;
  role_type: string;
  permissions: string[];
  admin_notes: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);
  
  // Create user dialog state
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    email: '',
    password: '',
    display_name: '',
    country: '',
    is_admin: false,
    role_type: 'User'
  });

  // Create admin dialog state
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createAdminData, setCreateAdminData] = useState<CreateAdminData>({
    user_id: '',
    role_type: 'Admin',
    permissions: ['user_management', 'report_management'],
    admin_notes: ''
  });

  // Load users and stats
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { users: userList, error } = await AdminService.getUsers({ limit: 100 });
      if (error) throw error;
      setUsers(userList || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { stats: statsData, error } = await AdminService.getStats();
      if (error) throw error;
      setStats(statsData);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const { error } = await AdminService.createUser(createUserData);
      if (error) throw error;
      
      toast.success('User created successfully');
      setCreateUserOpen(false);
      setCreateUserData({
        email: '',
        password: '',
        display_name: '',
        country: '',
        is_admin: false,
        role_type: 'User'
      });
      loadUsers();
    } catch (error) {
      toast.error('Failed to create user');
      console.error('Create user error:', error);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const { error } = await AdminService.createAdminRole(createAdminData);
      if (error) throw error;
      
      toast.success('Admin role created successfully');
      setCreateAdminOpen(false);
      setCreateAdminData({
        user_id: '',
        role_type: 'Admin',
        permissions: ['user_management', 'report_management'],
        admin_notes: ''
      });
      loadUsers();
    } catch (error) {
      toast.error('Failed to create admin role');
      console.error('Create admin error:', error);
    }
  };

  const handleBanUser = async (userId: string, banned: boolean) => {
    try {
      const { error } = await AdminService.banUser(userId, banned, banned ? 'Banned by admin' : 'Unbanned by admin');
      if (error) throw error;
      
      toast.success(banned ? 'User banned successfully' : 'User unbanned successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Ban user error:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <div className="p-6">Please log in to access the admin dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, admins, and system settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">Super Admin</span>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totals?.users || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totals?.reports || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totals?.courses || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totals?.quizzes || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="admins">Admin Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all users in the system</CardDescription>
                </div>
                <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>Add a new user to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={createUserData.email}
                          onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={createUserData.password}
                          onChange={(e) => setCreateUserData({...createUserData, password: e.target.value})}
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                      <div>
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          value={createUserData.display_name}
                          onChange={(e) => setCreateUserData({...createUserData, display_name: e.target.value})}
                          placeholder="Full Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={createUserData.country}
                          onChange={(e) => setCreateUserData({...createUserData, country: e.target.value})}
                          placeholder="Country"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="is_admin"
                          type="checkbox"
                          checked={createUserData.is_admin}
                          onChange={(e) => setCreateUserData({...createUserData, is_admin: e.target.checked})}
                        />
                        <Label htmlFor="is_admin">Make Admin</Label>
                      </div>
                      {createUserData.is_admin && (
                        <div>
                          <Label htmlFor="role_type">Admin Role</Label>
                          <Select
                            value={createUserData.role_type}
                            onValueChange={(value) => setCreateUserData({...createUserData, role_type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Moderator">Moderator</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Super Admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateUser}>Create User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              {loading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.display_name}</div>
                            <div className="text-sm text-muted-foreground">{user.user_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.country}</TableCell>
                        <TableCell>{user.points}</TableCell>
                        <TableCell>{user.rank || '-'}</TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge variant="secondary">
                              <Shield className="h-3 w-3 mr-1" />
                              {user.admin_roles?.[0]?.role_type || 'Admin'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {user.is_admin ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBanUser(user.user_id, false)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBanUser(user.user_id, true)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admin Management</CardTitle>
                  <CardDescription>Manage admin roles and permissions</CardDescription>
                </div>
                <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Shield className="h-4 w-4 mr-2" />
                      Create Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Admin</DialogTitle>
                      <DialogDescription>Promote a user to admin role</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user_id">Select User</Label>
                        <Select
                          value={createAdminData.user_id}
                          onValueChange={(value) => setCreateAdminData({...createAdminData, user_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.filter(u => !u.is_admin).map((user) => (
                              <SelectItem key={user.user_id} value={user.user_id}>
                                {user.display_name} ({user.user_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="admin_role_type">Admin Role</Label>
                        <Select
                          value={createAdminData.role_type}
                          onValueChange={(value) => setCreateAdminData({...createAdminData, role_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Moderator">Moderator</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Super Admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="admin_notes">Notes</Label>
                        <Input
                          id="admin_notes"
                          value={createAdminData.admin_notes}
                          onChange={(e) => setCreateAdminData({...createAdminData, admin_notes: e.target.value})}
                          placeholder="Reason for promotion"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateAdmin}>Create Admin</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.is_admin).map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{admin.display_name}</div>
                          <div className="text-sm text-muted-foreground">{admin.user_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {admin.admin_roles?.[0]?.role_type || 'Admin'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {admin.admin_roles?.[0]?.verification_status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.admin_roles?.[0]?.verification_status === 'Approved' ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Admin Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the admin role from {admin.display_name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>View and manage incident reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Report management interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
