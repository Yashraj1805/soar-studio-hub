import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
};

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Video upload not working',
    category: 'Technical Issue',
    status: 'in-progress',
    date: '2024-01-15',
  },
  {
    id: 'TKT-002',
    subject: 'Billing question about subscription',
    category: 'Billing',
    status: 'open',
    date: '2024-01-14',
  },
  {
    id: 'TKT-003',
    subject: 'Feature request: Dark mode',
    category: 'Feature Request',
    status: 'resolved',
    date: '2024-01-10',
  },
];

const statusConfig = {
  open: { color: 'bg-blue-500', label: 'Open' },
  'in-progress': { color: 'bg-yellow-500', label: 'In Progress' },
  resolved: { color: 'bg-green-500', label: 'Resolved' },
};

export const TicketList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-start justify-between p-4 rounded-2xl border bg-card hover:shadow-md transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{ticket.id}</span>
                  <Badge variant="outline" className="text-xs">
                    {ticket.category}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{ticket.subject}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {ticket.date}
                </div>
              </div>
              <Badge
                className={`${statusConfig[ticket.status].color} text-white`}
              >
                {statusConfig[ticket.status].label}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
