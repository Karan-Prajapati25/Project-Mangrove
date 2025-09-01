import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Settings, Bell, Shield, FileText, Save, RotateCcw, UserPlus, RefreshCw, Globe, Database } from 'lucide-react';

interface SystemConfig {
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    admin_email: string;
    notification_frequency: string;
  };
  security: {
    require_2fa: boolean;
    session_timeout: number;
    max_login_attempts: number;
    password_min_length: number;
  };
  reports: {
    auto_severity_detection: boolean;
    require_location: boolean;
    require_evidence: boolean;
    max_file_size_mb: number;
  };
  general: {
    site_name: string;
    maintenance_mode: boolean;
    registration_enabled: boolean;
    contact_email: string;
    terms_url: string;
    privacy_url: string;
  };
}

const SystemSettings = () => {
  const [config, setConfig] = useState<SystemConfig>({
    notifications: {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      admin_email: 'admin@mangrove.com',
      notification_frequency: 'immediate'
    },
    security: {
      require_2fa: false,
      session_timeout: 30,
      password_min_length: 8,
      max_login_attempts: 5
    },
    general: {
      site_name: 'Project Mangrove',
      maintenance_mode: false,
      registration_enabled: true,
      contact_email: 'contact@mangrove.com',
      terms_url: '',
      privacy_url: ''
    },
    reports: {
      auto_severity_detection: true,
      require_location: true,
      require_evidence: true,
      max_file_size_mb: 10
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    role: 'Admin'
  });
  const [loading, setLoading] = useState(false);

  const updateConfig = (section: keyof SystemConfig, key: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleAddAdmin = async () => {
    if (!adminData.email || !adminData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password,
          role: adminData.role
        })
      });

      if (!response.ok) throw new Error('Failed to create admin');

      toast.success('Admin created successfully');
      setAddAdminOpen(false);
      setAdminData({ email: '', password: '', role: 'Admin' });
    } catch (error) {
      toast.error('Failed to create admin');
      console.error('Create admin error:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('System settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save system settings');
      console.error('Save settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setConfig({
      notifications: {
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true,
        admin_email: 'admin@mangrove-project.com',
        notification_frequency: 'immediate'
      },
      security: {
        require_2fa: false,
        session_timeout: 24,
        max_login_attempts: 5,
        password_min_length: 8
      },
      reports: {
        auto_severity_detection: true,
        require_location: false,
        require_evidence: false,
        max_file_size_mb: 10
      },
      general: {
        site_name: 'Mangrove Guardian',
        maintenance_mode: false,
        registration_enabled: true,
        contact_email: 'contact@mangrove-project.com',
        terms_url: '/terms',
        privacy_url: '/privacy'
      }
    });
    setHasChanges(true);
    toast.info('Settings reset to defaults');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">System Settings</h2>
                <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Admin</DialogTitle>
                      <DialogDescription>
                        Create a new admin account with email and password
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={adminData.email}
                          onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={adminData.password}
                          onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                          placeholder="Minimum 8 characters"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-role">Admin Role</Label>
                        <Select
                          value={adminData.role}
                          onValueChange={(value) => setAdminData({...adminData, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Super Admin">Super Admin</SelectItem>
                            <SelectItem value="Moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddAdmin}>Create Admin</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges || loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={config.general.site_name}
                      onChange={(e) => updateConfig('general', 'site_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={config.general.contact_email}
                      onChange={(e) => updateConfig('general', 'contact_email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="terms_url">Terms of Service URL</Label>
                    <Input
                      id="terms_url"
                      value={config.general.terms_url}
                      onChange={(e) => updateConfig('general', 'terms_url', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="privacy_url">Privacy Policy URL</Label>
                    <Input
                      id="privacy_url"
                      value={config.general.privacy_url}
                      onChange={(e) => updateConfig('general', 'privacy_url', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable the site for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={config.general.maintenance_mode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenance_mode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={config.general.registration_enabled}
                    onCheckedChange={(checked) => updateConfig('general', 'registration_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={config.notifications.admin_email}
                    onChange={(e) => updateConfig('notifications', 'admin_email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notification_frequency">Notification Frequency</Label>
                  <Select
                    value={config.notifications.notification_frequency}
                    onValueChange={(value) => updateConfig('notifications', 'notification_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.email_enabled}
                      onCheckedChange={(checked) => updateConfig('notifications', 'email_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.sms_enabled}
                      onCheckedChange={(checked) => updateConfig('notifications', 'sms_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.push_enabled}
                      onCheckedChange={(checked) => updateConfig('notifications', 'push_enabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session_timeout">Session Timeout (hours)</Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      min="1"
                      max="168"
                      value={config.security.session_timeout}
                      onChange={(e) => updateConfig('security', 'session_timeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                    <Input
                      id="max_login_attempts"
                      type="number"
                      min="3"
                      max="10"
                      value={config.security.max_login_attempts}
                      onChange={(e) => updateConfig('security', 'max_login_attempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password_min_length">Minimum Password Length</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    min="6"
                    max="32"
                    value={config.security.password_min_length}
                    onChange={(e) => updateConfig('security', 'password_min_length', parseInt(e.target.value))}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={config.security.require_2fa}
                    onCheckedChange={(checked) => updateConfig('security', 'require_2fa', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Report Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max_file_size">Maximum File Size (MB)</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    min="1"
                    max="100"
                    value={config.reports.max_file_size_mb}
                    onChange={(e) => updateConfig('reports', 'max_file_size_mb', parseInt(e.target.value))}
                    className="max-w-xs"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Severity Detection</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically determine report severity based on type
                      </p>
                    </div>
                    <Switch
                      checked={config.reports.auto_severity_detection}
                      onCheckedChange={(checked) => updateConfig('reports', 'auto_severity_detection', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Location</Label>
                      <p className="text-sm text-muted-foreground">
                        Make location mandatory for all reports
                      </p>
                    </div>
                    <Switch
                      checked={config.reports.require_location}
                      onCheckedChange={(checked) => updateConfig('reports', 'require_location', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Evidence</Label>
                      <p className="text-sm text-muted-foreground">
                        Make evidence upload mandatory for all reports
                      </p>
                    </div>
                    <Switch
                      checked={config.reports.require_evidence}
                      onCheckedChange={(checked) => updateConfig('reports', 'require_evidence', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
