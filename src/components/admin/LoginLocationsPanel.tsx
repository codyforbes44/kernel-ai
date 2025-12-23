import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, MapPin, Shield, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface LoginLocation {
  id: string;
  user_id: string;
  ip_address: string;
  country: string | null;
  city: string | null;
  region: string | null;
  login_count: number | null;
  is_trusted: boolean | null;
  first_seen_at: string;
  last_seen_at: string;
  user_name?: string;
}

interface LoginLocationsPanelProps {
  locations: LoginLocation[];
  loading?: boolean;
  onRefresh?: () => void;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function LoginLocationsPanel({ locations, loading, onRefresh }: LoginLocationsPanelProps) {
  const countryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    locations.forEach(loc => {
      const country = loc.country || 'Unknown';
      breakdown[country] = (breakdown[country] || 0) + 1;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [locations]);

  const cityBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    locations.forEach(loc => {
      const city = loc.city || 'Unknown';
      breakdown[city] = (breakdown[city] || 0) + 1;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [locations]);

  const trustedCount = locations.filter(l => l.is_trusted).length;
  const uniqueCountries = new Set(locations.map(l => l.country).filter(Boolean)).size;
  const totalLogins = locations.reduce((sum, l) => sum + (l.login_count || 0), 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <MapPin className="h-4 w-4" />
              Unique Locations
            </div>
            <p className="text-2xl font-bold">{locations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Globe className="h-4 w-4" />
              Countries
            </div>
            <p className="text-2xl font-bold">{uniqueCountries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Shield className="h-4 w-4" />
              Trusted
            </div>
            <p className="text-2xl font-bold">{trustedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              Total Logins
            </div>
            <p className="text-2xl font-bold">{totalLogins.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logins by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {countryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityBreakdown} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Login Locations
          </CardTitle>
          <CardDescription>Geographic distribution of user logins</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Logins</TableHead>
                  <TableHead>Trust</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {loc.city || 'Unknown'}, {loc.country || 'Unknown'}
                          </div>
                          {loc.region && (
                            <div className="text-xs text-muted-foreground">{loc.region}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {loc.ip_address}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{loc.login_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      {loc.is_trusted ? (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 gap-1">
                          <Shield className="h-3 w-3" />
                          Trusted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <ShieldOff className="h-3 w-3" />
                          Untrusted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(loc.first_seen_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(loc.last_seen_at), 'MMM d, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
