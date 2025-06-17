
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, Calendar, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Vehicles",
      value: "24",
      description: "Active fleet",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Drivers",
      value: "18",
      description: "Currently available",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Today's Bookings",
      value: "12",
      description: "Scheduled trips",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Revenue",
      value: "₹45,234",
      description: "This month",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your car travel platform
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest booking requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((booking) => (
                <div key={booking} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Booking #{booking}001</p>
                    <p className="text-sm text-muted-foreground">
                      Mumbai to Pune • 2 hours ago
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Driver Availability</CardTitle>
            <CardDescription>
              Current status of drivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Rajesh Kumar", status: "Available", vehicle: "MH 12 AB 1234" },
                { name: "Amit Singh", status: "On Trip", vehicle: "MH 14 CD 5678" },
                { name: "Suresh Patil", status: "Available", vehicle: "MH 16 EF 9012" },
              ].map((driver, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    driver.status === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {driver.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
