import React from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Bell, ShoppingCart, Award, Sparkles, FolderLock, CheckCircle } from 'lucide-react';

export const NotificationsList: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useVendor();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-sky-500" />;
      case 'product':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'wallet':
        return <Award className="h-4 w-4 text-emerald-500" />;
      case 'kyc':
        return <FolderLock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'order': return 'bg-sky-500/10';
      case 'product': return 'bg-purple-500/10';
      case 'wallet': return 'bg-emerald-500/10';
      case 'kyc': return 'bg-amber-500/10';
      default: return 'bg-primary/10';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Notifications & System Logs</h1>
          <p className="text-xs text-muted-foreground">Review incoming order alerts, wallet payouts updates, and product catalog approval notes.</p>
        </div>
        <Button
          onClick={markAllAsRead}
          size="sm"
          className="flex items-center gap-1.5 bg-primary text-white font-bold h-9 cursor-pointer text-xs"
        >
          <CheckCircle className="h-4 w-4" /> Mark All as Read
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Activity Log Registry</CardTitle>
          <CardDescription>Comprehensive audit history of alerts generated for your account</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Notification Details</TableHead>
                <TableHead>Log Family</TableHead>
                <TableHead>Created Time</TableHead>
                <TableHead>Audit Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map(notif => (
                <TableRow
                  key={notif.id}
                  className={`align-middle transition-colors ${
                    notif.isRead ? 'opacity-60 hover:opacity-100' : 'bg-primary/[0.02]'
                  }`}
                >
                  <TableCell className="pl-4">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getBg(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    <div>{notif.title}</div>
                    <p className="text-xs text-muted-foreground font-normal leading-relaxed mt-0.5 max-w-lg">
                      {notif.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {notif.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(notif.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {notif.isRead ? (
                      <Badge variant="secondary">Read</Badge>
                    ) : (
                      <Badge variant="success">New Alert</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    {!notif.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notif.id)}
                        className="h-7 px-2.5 text-xs cursor-pointer border-border"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {notifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    No system alerts in log files.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsList;
