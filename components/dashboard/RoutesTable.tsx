'use client';

import { CompactTable, DataBadge } from '@/components/shared/CompactTable';

// Sample data matching the image
const routesData = [
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "ALBERTON",
    activeSuburbs: 1,
    totalStops: 1
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "ALRODE",
    activeSuburbs: 1,
    totalStops: 2
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "EAST RAND 01",
    activeSuburbs: 1,
    totalStops: 11
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "EAST RAND 02",
    activeSuburbs: 1,
    totalStops: 2
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "EAST RAND 03",
    activeSuburbs: 1,
    totalStops: 4
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "EAST RAND 04",
    activeSuburbs: 3,
    totalStops: 20
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "EAST RAND 10",
    activeSuburbs: 1,
    totalStops: 2
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "EAST RAND 11",
    activeSuburbs: 1,
    totalStops: 1
  },
  {
    branch: "Allied Steelrode (Pty) Ltd Head Office",
    route: "JHB SOUTH CENTRAL",
    activeSuburbs: 1,
    totalStops: 4
  }
];

const columns = [
  {
    key: 'branch',
    label: 'Branch',
    align: 'left' as const
  },
  {
    key: 'route',
    label: 'Route',
    align: 'left' as const,
    sortable: true
  },
  {
    key: 'activeSuburbs',
    label: 'Active Suburbs',
    align: 'center' as const,
    sortable: true,
    render: (item: any) => <DataBadge value={item.activeSuburbs} />
  },
  {
    key: 'totalStops',
    label: 'Total Stops',
    align: 'center' as const,
    sortable: true,
    render: (item: any) => <DataBadge value={item.totalStops} />
  }
];

export function RoutesTable() {
  return (
    <CompactTable
      data={routesData}
      columns={columns}
      title="Routes Management"
      searchPlaceholder="Search Tomorrow's orders.."
      showDownload={true}
      showColumns={true}
    />
  );
}
