import { Suspense } from 'react';
import { EventsPieChart } from './events-pie-chart';
import { MonthlyParticipantsChart } from './monthly-participants-chart';
import { EventsAreaChart } from './events-area-chart';

export default async function DashboardPage() {
    return (
        <div className="grid gap-4">
            <div className="grid gap-4 grid-cols-12">
                <div className="col-span-6">
                    <Suspense fallback={<div>Loading...</div>}>
                        <EventsPieChart />
                    </Suspense>
                </div>
                <div className="col-span-6">
                    <Suspense fallback={<div>Loading...</div>}>
                        <MonthlyParticipantsChart />
                    </Suspense>
                </div>
            </div>
            <div className="grid gap-4 grid-cols-12">
                <div className="col-span-6">
                    <Suspense fallback={<div>Loading...</div>}>
                        <EventsAreaChart />
                    </Suspense>
                </div>
            </div>
        </div>
    );
} 