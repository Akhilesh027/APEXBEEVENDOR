import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Star, MessageSquare, Reply, TrendingUp, Sparkles, Smile, Frown, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const API_BASE = 'https://server.apexbee.in/api';

interface StoreReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  replyDate?: string;
}

export const ReviewsRatings: React.FC = () => {
  const { reviews, products, submitReviewReply, profile } = useVendor();
  const [activeTab, setActiveTab] = useState<'product' | 'store' | 'analytics'>('product');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

  // Real store reviews from API
  const [storeReviews, setStoreReviews] = useState<StoreReview[]>([]);
  const [storeReviewsLoading, setStoreReviewsLoading] = useState(false);

  // Compute real stats from context reviews (product reviews)
  const totalReviews = reviews.length;
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  // Build rating distribution from real reviews
  const ratingDistribution = [
    { stars: '5 Stars', count: reviews.filter(r => r.rating === 5).length, fill: '#10b981' },
    { stars: '4 Stars', count: reviews.filter(r => r.rating === 4).length, fill: '#34d399' },
    { stars: '3 Stars', count: reviews.filter(r => r.rating === 3).length, fill: '#f59e0b' },
    { stars: '2 Stars', count: reviews.filter(r => r.rating === 2).length, fill: '#fbbf24' },
    { stars: '1 Star',  count: reviews.filter(r => r.rating === 1).length, fill: '#ef4444' },
  ];

  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const positivePercent = reviews.length > 0
    ? Math.round((positiveCount / reviews.length) * 100)
    : 0;

  // Products sorted by rating (real data)
  const lovedProducts = [...products]
    .filter(p => p.rating !== undefined && p.rating >= 4)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const lowestProducts = [...products]
    .filter(p => p.rating !== undefined && p.rating < 3)
    .sort((a, b) => (a.rating || 0) - (b.rating || 0))
    .slice(0, 3);

  // Fetch store-level reviews from API
  useEffect(() => {
    const fetchStoreReviews = async () => {
      const token = localStorage.getItem('token');
      const vendorId = profile?.id || profile?._id || (profile as any)?.userId;
      if (!vendorId || !token) return;

      setStoreReviewsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/vendors/${vendorId}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.reviews) ? data.reviews : [];
          setStoreReviews(list.map((r: any) => ({
            id: r._id || r.id,
            customerName: r.customerName || r.user?.name || 'Anonymous',
            rating: r.rating || 0,
            comment: r.comment || r.review || '',
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '',
            reply: r.vendorReply || r.reply,
            replyDate: r.replyDate ? new Date(r.replyDate).toLocaleDateString('en-IN') : undefined,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch store reviews:', err);
      } finally {
        setStoreReviewsLoading(false);
      }
    };

    fetchStoreReviews();
  }, [profile]);

  // Most loved product (highest rating among real products)
  const topProduct = lovedProducts[0];

  const handleReplySubmit = (reviewId: string) => {
    const replyText = replyInputs[reviewId];
    if (!replyText || !replyText.trim()) return;
    submitReviewReply(reviewId, replyText);
    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
    setEditingReplyId(null);
  };

  const getStarRating = (count: number) => {
    return (
      <div className="flex gap-0.5 items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < count ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Reviews &amp; Ratings</h1>
          <p className="text-xs text-muted-foreground">Interact with customer feedback, analyze rating metrics, and inspect product reviews.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'product', label: 'Product Reviews', icon: <MessageSquare className="h-3.5 w-3.5" /> },
          { id: 'store', label: 'Store Reviews', icon: <Star className="h-3.5 w-3.5" /> },
          { id: 'analytics', label: 'Review Analytics', icon: <TrendingUp className="h-3.5 w-3.5" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Store Rating</span>
            <span className="text-2xl font-black text-foreground">{avgRating > 0 ? `${avgRating} / 5.0` : '—'}</span>
            <div className="mt-1">{getStarRating(Math.round(avgRating))}</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <Star className="h-6 w-6 fill-amber-500/35" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Reviews</span>
            <span className="text-2xl font-black text-foreground">{totalReviews} Received</span>
            <span className="text-[10px] text-emerald-500 font-medium">
              {totalReviews > 0 ? `${positivePercent}% positive rating` : 'No reviews yet'}
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
            <MessageSquare className="h-6 w-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Top Loved Product</span>
            {topProduct ? (
              <>
                <span className="text-sm font-black text-foreground truncate max-w-[200px] block">{topProduct.name}</span>
                <span className="text-[10px] text-amber-500 font-bold">★ {topProduct.rating?.toFixed(1) || '—'} Rating</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No rated products yet</span>
            )}
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Tab Contents */}
      <div className="flex flex-col gap-4">
        {activeTab === 'product' && (
          <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No product reviews received yet.</div>
            ) : reviews.map(rev => (
              <Card key={rev.id} className="border border-border/80 hover:border-muted-foreground/30 transition-all">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{rev.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">Reviewed: <strong className="text-foreground">{rev.productName}</strong> on {rev.date}</span>
                    </div>
                    <div>{getStarRating(rev.rating)}</div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>

                  {/* Reply timeline */}
                  {rev.reply ? (
                    <div className="bg-secondary/45 border-l-2 border-primary p-3 rounded-r-lg flex flex-col gap-1 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-1 text-primary">
                          <Reply className="h-3.5 w-3.5" /> Your Store Reply
                        </span>
                        {rev.replyDate && <span className="text-[10px] text-muted-foreground">{rev.replyDate}</span>}
                      </div>
                      <p className="text-muted-foreground mt-0.5">&quot;{rev.reply}&quot;</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-1">
                      {editingReplyId === rev.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={2}
                            placeholder="Write a polite response to this customer..."
                            value={replyInputs[rev.id] || ''}
                            onChange={(e) => setReplyInputs(prev => ({ ...prev, [rev.id]: e.target.value }))}
                            className="w-full border border-border rounded-lg p-2 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                          <div className="flex gap-2 self-end">
                            <Button size="sm" onClick={() => handleReplySubmit(rev.id)} className="text-xs px-3 py-1 cursor-pointer">
                              Submit Reply
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingReplyId(null)} className="text-xs px-3 py-1 cursor-pointer">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReplyId(rev.id)}
                          className="text-xs font-bold text-primary hover:bg-secondary w-fit flex items-center gap-1.5 cursor-pointer"
                        >
                          <Reply className="h-3.5 w-3.5" /> Reply to Review
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'store' && (
          <div className="flex flex-col gap-4">
            {storeReviewsLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading store reviews...</span>
              </div>
            ) : storeReviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No store reviews received yet.</div>
            ) : storeReviews.map(rev => (
              <Card key={rev.id} className="border border-border/80">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{rev.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">Reviewed Storefront on {rev.date}</span>
                    </div>
                    <div>{getStarRating(rev.rating)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">&quot;{rev.comment}&quot;</p>
                  {rev.reply && (
                    <div className="bg-secondary/45 border-l-2 border-primary p-3 rounded-r-lg flex flex-col gap-1 text-xs mt-2">
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Reply className="h-3.5 w-3.5" /> Store Response
                      </span>
                      <p className="text-muted-foreground mt-0.5">&quot;{rev.reply}&quot;</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Rating Distribution</CardTitle>
                <CardDescription>Breakdown of ratings count received across catalog items.</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {ratingDistribution.every(d => d.count === 0) ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No review data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
                      <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                      <YAxis dataKey="stars" type="category" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-emerald-500">
                    <Smile className="h-4.5 w-4.5" /> Most Loved Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border/40">
                  {lovedProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">No high-rated products yet.</div>
                  ) : lovedProducts.map(p => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground truncate max-w-[180px]">{p.name}</span>
                      <Badge variant="success" className="font-bold">★ {p.rating?.toFixed(1)} Rating</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-destructive">
                    <Frown className="h-4.5 w-4.5" /> Lowest Rated Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border/40">
                  {lowestProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">No critical rating alerts.</div>
                  ) : lowestProducts.map(p => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground truncate max-w-[180px]">{p.name}</span>
                      <Badge variant="destructive" className="font-bold">★ {p.rating?.toFixed(1)} Rating</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ReviewsRatings;
