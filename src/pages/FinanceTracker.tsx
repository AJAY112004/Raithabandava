import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Plus, Download, IndianRupee, Trash, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
}

const FinanceTracker = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [yearViewOpen, setYearViewOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const incomeCategories = ['crop_sales', 'subsidies', 'rentals', 'other'];
  const expenseCategories = ['seeds', 'fertilizers', 'transport', 'labor', 'equipment', 'irrigation', 'other'];

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .insert([{
          user_id: user?.id,
          type: formData.type,
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          transaction_date: formData.transaction_date
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction added successfully"
      });

      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      
      setDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const startDate = new Date();
    
    if (selectedPeriod === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    return transactions.filter(t => new Date(t.transaction_date) >= startDate);
  };

  // Year-specific helpers
  const getYearTransactions = (year: number) => transactions.filter(t => new Date(t.transaction_date).getFullYear() === year);
  const availableYears = Array.from(new Set(transactions.map(t => new Date(t.transaction_date).getFullYear()))).sort((a,b)=>b-a);
  const groupByYear = () => {
    const map: { [year: number]: { year: number; income: number; expense: number; transactions: Transaction[] } } = {};
    transactions.forEach(t => {
      const y = new Date(t.transaction_date).getFullYear();
      if (!map[y]) map[y] = { year: y, income: 0, expense: 0, transactions: [] };
      map[y].transactions.push(t);
      if (t.type === 'income') map[y].income += t.amount; else map[y].expense += t.amount;
    });
    return Object.values(map).sort((a,b)=>b.year - a.year).map(v => ({...v, profit: v.income - v.expense}));
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('financial_transactions').delete().eq('id', id).eq('user_id', user?.id);
      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Deleted', description: 'Transaction removed.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to delete transaction.', variant: 'destructive' });
    }
  };

  const handleResetYear = async (year: number) => {
    if (!window.confirm(`Reset all transactions for ${year}? This cannot be undone.`)) return;
    try {
      const start = new Date(year,0,1).toISOString().split('T')[0];
      const end = new Date(year,11,31).toISOString().split('T')[0];
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('user_id', user?.id)
        .gte('transaction_date', start)
        .lte('transaction_date', end);
      if (error) throw error;
      setTransactions(prev => prev.filter(t => new Date(t.transaction_date).getFullYear() !== year));
      toast({ title: 'Year Reset', description: `All transactions for ${year} deleted.` });
      if (selectedYear === year) setSelectedYear(currentYear);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to reset year.', variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) {
      toast({ title: 'No Data', description: 'No transactions to export.', variant: 'destructive' });
      return;
    }

    // CSV headers
    const headers = ['Date', 'Type', 'Category', 'Amount (₹)', 'Description'];
    
    // Convert transactions to CSV rows
    const rows = filtered.map(t => [
      new Date(t.transaction_date).toLocaleDateString('en-IN'),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.category,
      t.amount.toFixed(2),
      `"${t.description.replace(/"/g, '""')}"` // Escape quotes in description
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `finance_transactions_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'Export Successful', description: `Downloaded ${filtered.length} transactions.` });
  };

  const getChartData = () => {
    const filtered = getFilteredTransactions();
    const monthlyData: { [key: string]: { income: number; expense: number; profit: number; month: string; sortKey: string } } = {};
    
    filtered.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, profit: 0, month: monthName, sortKey: monthKey };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });
    
    // Calculate profit and sort by date
    return Object.values(monthlyData)
      .map(d => ({ ...d, profit: d.income - d.expense }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  };

  const getCategoryData = () => {
    const filtered = getFilteredTransactions();
    const categoryTotals: { [key: string]: number } = {};
    
    filtered.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  const getTotals = () => {
    const filtered = getFilteredTransactions();
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, profit: totalIncome - totalExpense };
  };

  const { totalIncome, totalExpense, profit } = getTotals();
  const chartData = getChartData();
  const categoryData = getCategoryData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Finance Tracker</h1>
          <p className="text-muted-foreground">Track your farm's income and expenses</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Record a new income or expense transaction.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value, category: ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>

              <Button type="submit" className="w-full">Add Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <IndianRupee className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{profit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            {availableYears.length > 0 && (
              <Select value={String(selectedYear)} onValueChange={(v)=>setSelectedYear(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Trend</CardTitle>
                <CardDescription>Track your financial performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, name: string) => {
                        const labels: { [key: string]: string } = {
                          income: 'Income',
                          expense: 'Expense',
                          profit: 'Net Profit'
                        };
                        return [`₹${Number(value).toLocaleString()}`, labels[name] || name];
                      }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={(value) => {
                        const labels: { [key: string]: string } = {
                          income: 'Income',
                          expense: 'Expense',
                          profit: 'Net Profit'
                        };
                        return labels[value] || value;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#22c55e" 
                      strokeWidth={2.5}
                      fill="url(#colorIncome)"
                      name="income"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#ef4444" 
                      strokeWidth={2.5}
                      fill="url(#colorExpense)"
                      name="expense"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#3b82f6' }}
                      name="profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Spending distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="42%"
                      innerRadius={60}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={3}
                      label={false}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: string, props: any) => [
                        `₹${Number(value).toLocaleString()}`,
                        props.payload.name
                      ]}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      formatter={(value, entry: any) => {
                        const total = categoryData.reduce((sum, d) => sum + d.value, 0);
                        const percent = ((entry.payload.value / total) * 100).toFixed(1);
                        const amount = `₹${Number(entry.payload.value).toLocaleString()}`;
                        return `${entry.payload.name}: ${amount} (${percent}%)`;
                      }}
                      wrapperStyle={{ 
                        fontSize: '12px', 
                        paddingTop: '15px',
                        lineHeight: '1.6'
                      }}
                      iconSize={10}
                      layout="horizontal"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredTransactions().slice(0, 20).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {transaction.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.description || 'No description'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>\n                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}\n                      </div>
                      <Button variant="ghost" size="sm" onClick={()=>handleDeleteTransaction(transaction.id)} title="Delete">
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {getFilteredTransactions().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found for the selected period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yearly">
          <Card>
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <CardTitle>Yearly Summary</CardTitle>
                <Button variant="outline" size="sm" onClick={()=>setYearViewOpen(o=>!o)}>
                  {yearViewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              <CardDescription>Totals grouped by year. Expand to view and reset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupByYear().map(y => (
                <div key={y.year} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">{y.year}</span>
                      <span className="text-xs text-muted-foreground">{y.transactions.length} transaction{y.transactions.length!==1?'s':''}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm"><span className="text-green-600 font-medium">Income:</span> ₹{y.income.toLocaleString()}</div>
                      <div className="text-sm"><span className="text-red-600 font-medium">Expense:</span> ₹{y.expense.toLocaleString()}</div>
                      <div className={`text-sm font-semibold ${y.profit>=0?'text-green-600':'text-red-600'}`}>Profit: ₹{y.profit.toLocaleString()}</div>
                      <Button variant="outline" size="sm" onClick={()=>handleResetYear(y.year)} title="Reset Year">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {yearViewOpen && selectedYear === y.year && (
                    <div className="space-y-2">
                      {getYearTransactions(y.year).map(t => (
                        <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                            <Badge variant={t.type==='income'?'default':'secondary'}>{t.type}</Badge>
                            <div className="text-sm">
                              <div className="font-medium">{t.category.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</div>
                              <div className="text-xs text-muted-foreground">{new Date(t.transaction_date).toLocaleDateString()} • {t.description || 'No description'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-sm font-semibold ${t.type==='income'?'text-green-600':'text-red-600'}`}>{t.type==='income'?'+':'-'}₹{t.amount.toLocaleString()}</span>
                            <Button variant="ghost" size="sm" onClick={()=>handleDeleteTransaction(t.id)}><Trash className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                      {getYearTransactions(y.year).length===0 && <div className="text-xs text-muted-foreground">No transactions for {y.year}.</div>}
                    </div>
                  )}
                </div>
              ))}
              {groupByYear().length===0 && <div className="text-center text-muted-foreground">No transactions recorded yet.</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceTracker;