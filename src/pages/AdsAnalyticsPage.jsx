/**
 * Ads Analytics Page
 * Admin page to track all ads activities (views, clicks, etc.)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  RefreshCw,
  ArrowLeft,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { exportToExcel, exportTableToPDF } from '@/utils/exportUtils';
import { Download } from 'lucide-react';

const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640'
};

export default function AdsAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalClicks: 0,
    averageCTR: 0
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/ads?per_page=100');
      const adsData = response.data?.ads || [];
      setAds(adsData);

      // Calculate statistics
      const activeAds = adsData.filter(ad => {
        if (!ad.online) return false;
        const now = new Date();
        const startAt = new Date(ad.start_at);
        const expireAt = new Date(ad.expire_at);
        return now >= startAt && now <= expireAt;
      });

      const totalViews = adsData.reduce((sum, ad) => sum + (ad.nb_views || 0), 0);
      const totalClicks = adsData.reduce((sum, ad) => sum + (ad.nb_clicks || 0), 0);
      const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;

      setStats({
        totalAds: adsData.length,
        activeAds: activeAds.length,
        totalViews,
        totalClicks,
        averageCTR: parseFloat(averageCTR)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'website', label: 'Website' },
      { key: 'company_type', label: 'Company Type' },
      { key: 'nb_views', label: 'Views' },
      { key: 'nb_clicks', label: 'Clicks' },
      { 
        key: 'ctr', 
        label: 'CTR (%)',
        transform: (ad) => {
          const views = ad.nb_views || 0;
          const clicks = ad.nb_clicks || 0;
          return views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';
        }
      },
      { key: 'online', label: 'Status', transform: (ad) => ad.online ? 'Online' : 'Offline' },
      { key: 'start_at', label: 'Start Date', transform: (ad) => new Date(ad.start_at).toLocaleString() },
      { key: 'expire_at', label: 'Expire Date', transform: (ad) => new Date(ad.expire_at).toLocaleString() }
    ];
    
    const data = ads.map(ad => ({
      ...ad,
      ctr: columns.find(c => c.key === 'ctr')?.transform?.(ad),
      online: columns.find(c => c.key === 'online')?.transform?.(ad),
      start_at: columns.find(c => c.key === 'start_at')?.transform?.(ad),
      expire_at: columns.find(c => c.key === 'expire_at')?.transform?.(ad)
    }));

    exportToExcel(data, columns, 'ads-analytics');
  };

  const handleExportPDF = () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'website', label: 'Website' },
      { key: 'company_type', label: 'Company Type' },
      { key: 'nb_views', label: 'Views' },
      { key: 'nb_clicks', label: 'Clicks' },
      { 
        key: 'ctr', 
        label: 'CTR (%)',
        transform: (ad) => {
          const views = ad.nb_views || 0;
          const clicks = ad.nb_clicks || 0;
          return views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';
        }
      },
      { key: 'online', label: 'Status', transform: (ad) => ad.online ? 'Online' : 'Offline' }
    ];
    
    const data = ads.map(ad => ({
      ...ad,
      ctr: columns.find(c => c.key === 'ctr')?.transform?.(ad),
      online: columns.find(c => c.key === 'online')?.transform?.(ad)
    }));

    exportTableToPDF(data, columns, 'Ads Analytics Report', 'ads-analytics');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{
              backgroundImage: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})`
            }}>
              Ads Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Track views, clicks, and performance metrics for all ads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin-panel-page')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAds}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAds}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageCTR}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Ads Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ads Performance</CardTitle>
              <Button variant="outline" size="icon" onClick={fetchAds} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin" style={{ color: COLORS.teal }} />
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No ads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Company Type</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>CTR (%)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Expire Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => {
                      const views = ad.nb_views || 0;
                      const clicks = ad.nb_clicks || 0;
                      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';
                      const isActive = ad.online && new Date() >= new Date(ad.start_at) && new Date() <= new Date(ad.expire_at);
                      
                      return (
                        <TableRow key={ad.id}>
                          <TableCell className="font-medium">{ad.id}</TableCell>
                          <TableCell>{ad.website || 'N/A'}</TableCell>
                          <TableCell>{ad.company_type || 'N/A'}</TableCell>
                          <TableCell>{views.toLocaleString()}</TableCell>
                          <TableCell>{clicks.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`font-semibold ${parseFloat(ctr) > 2 ? 'text-green-600' : parseFloat(ctr) > 1 ? 'text-yellow-600' : 'text-gray-600'}`}>
                              {ctr}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(ad.start_at).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(ad.expire_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
