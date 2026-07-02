import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Star, MessageSquare, Reply, TrendingUp, Sparkles, Smile, Frown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export const ReviewsRatings: React.FC = () => {
  const { reviews, products, submitReviewReply, profile } = useVendor();
  const [activeTab, setActiveTab] = useState<'product' | 'store' | 'analytics'>('product');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

  // Store overall stats
  const totalReviews = reviews.length + 12; // baseline mock reviews
  const avgRating = 4.4;
  const ratingDistribution = [
    { stars: '5 Stars', count: 32, fill: '#10b981' },
    { stars: '4 Stars', count: 12, fill: '#34d399' },
    { stars: '3 Stars', count: 4, fill: '#f59e0b' },
    { stars: '2 Stars', count: 2, fill: '#fbbf24' },
    { stars: '1 Star', count: 1, fill: '#ef4444' }
  ];

  // Store reviews mock
  const storeReviews = [
    { id: 'SREV-1', customerName: 'Ramesh Patil', rating: 5, comment: `Very fast dispatch. Ordered items were packaged extremely well. ${profile.businessName} is one of the most reliable apparel suppliers on the platform.`, date: '2026-06-10', reply: 'Thank you Ramesh! We do our best to dispatch within 24 hours.' },
    { id: 'SREV-2', customerName: 'Priyanka Sen', rating: 4, comment: 'Product design is lovely, return policies are very straightforward. Sizing fits well.', date: '2026-06-07' }
  ];

  // Most loved / lowest rated products calculations
  const lovedProducts = products.slice(0, 2);
  const lowestProducts = products.slice(2, 3);

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
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Reviews & Ratings</h1>
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
            <span className="text-2xl font-black text-foreground">{avgRating} / 5.0</span>
            <div className="mt-1">{getStarRating(4)}</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <Star className="h-6 w-6 fill-amber-500/35" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Reviews</span>
            <span className="text-2xl font-black text-foreground">{totalReviews} Received</span>
            <span className="text-[10px] text-emerald-500 font-medium">94.5% positive rating</span>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
            <MessageSquare className="h-6 w-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Loved Product</span>
            <span className="text-sm font-black text-foreground truncate max-w-[200px] block">Classic Silk Nehru Jacket</span>
            <span className="text-[10px] text-amber-500 font-bold">★ 4.8 Rating (38 reviews)</span>
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
            {reviews.map(rev => (
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
                    "{rev.comment}"
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
                      <p className="text-muted-foreground mt-0.5">"{rev.reply}"</p>
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
            {storeReviews.map(rev => (
              <Card key={rev.id} className="border border-border/80">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{rev.customerName}</span>
                      <span className="text-[10px] text-muted-foreground">Reviewed Storefront on {rev.date}</span>
                    </div>
                    <div>{getStarRating(rev.rating)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">"{rev.comment}"</p>
                  {rev.reply && (
                    <div className="bg-secondary/45 border-l-2 border-primary p-3 rounded-r-lg flex flex-col gap-1 text-xs mt-2">
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Reply className="h-3.5 w-3.5" /> Store Response
                      </span>
                      <p className="text-muted-foreground mt-0.5">"{rev.reply}"</p>
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
                  {lovedProducts.map(p => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground truncate max-w-[180px]">{p.name}</span>
                      <Badge variant="success" className="font-bold">★ 4.8 Rating</Badge>
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
                  {lowestProducts.map(p => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground truncate max-w-[180px]">{p.name}</span>
                      <Badge variant="destructive" className="font-bold">★ 2.0 Rating</Badge>
                    </div>
                  ))}
                  {lowestProducts.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">No critical rating alerts.</div>
                  )}
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
