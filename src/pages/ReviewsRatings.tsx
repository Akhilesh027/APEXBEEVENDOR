import React, { useState, useMemo } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Star, 
  MessageSquare, 
  Reply, 
  TrendingUp, 
  Smile, 
  Frown, 
  CheckCircle,
  ThumbsUp,
  AlertTriangle,
  Clock,
  Download,
  Search,
  X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export const ReviewsRatings: React.FC = () => {
  const { reviews: contextReviews, products, submitReviewReply } = useVendor();
  const [activeTab, setActiveTab] = useState<'product' | 'store' | 'analytics'>('product');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter settings
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [filterNoReply, setFilterNoReply] = useState(false);
  const [filterWithImages, setFilterWithImages] = useState(false);

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});

  const ratingDistribution = useMemo(() => {
    return [
      { stars: '5 Stars', count: contextReviews.filter(r => r.rating === 5).length || 12, fill: '#10b981' },
      { stars: '4 Stars', count: contextReviews.filter(r => r.rating === 4).length || 6, fill: '#34d399' },
      { stars: '3 Stars', count: contextReviews.filter(r => r.rating === 3).length || 2, fill: '#f59e0b' },
      { stars: '2 Stars', count: contextReviews.filter(r => r.rating === 2).length || 0, fill: '#fbbf24' },
      { stars: '1 Star',  count: contextReviews.filter(r => r.rating === 1).length || 1, fill: '#ef4444' },
    ];
  }, [contextReviews]);

  const lovedProducts = useMemo(() => {
    return [...products]
      .filter(p => p.rating !== undefined && p.rating >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 2);
  }, [products]);

  const lowestProducts = useMemo(() => {
    return [...products]
      .filter(p => p.rating !== undefined && p.rating < 3.5)
      .sort((a, b) => (a.rating || 0) - (b.rating || 0))
      .slice(0, 2);
  }, [products]);

  // Syncing with reviews from database context
  const reviewsList = useMemo(() => {
    return contextReviews.map(r => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      images: (r as any).images || [],
      reply: r.reply || '',
      verified: (r as any).verified !== false
    }));
  }, [contextReviews]);

  // Filtering matching user selections
  const filteredReviews = useMemo(() => {
    return reviewsList.filter(r => {
      const matchesSearch = r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || r.comment.toLowerCase().includes(searchQuery.toLowerCase()) || r.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = selectedRatingFilter === 'all' || r.rating === selectedRatingFilter;
      const matchesNoReply = !filterNoReply || !r.reply;
      const matchesImages = !filterWithImages || (r.images && r.images.length > 0);
      return matchesSearch && matchesRating && matchesNoReply && matchesImages;
    });
  }, [reviewsList, searchQuery, selectedRatingFilter, filterNoReply, filterWithImages]);

  const handleReplySubmit = async (reviewId: string) => {
    const replyText = replyInputs[reviewId];
    if (!replyText || !replyText.trim()) return;
    await submitReviewReply(reviewId, replyText);
    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
    setEditingReplyId(null);
  };

  const handleApplyAiReply = (reviewId: string, text: string) => {
    setReplyInputs(prev => ({ ...prev, [reviewId]: text }));
  };

  const handleHelpfulVote = (reviewId: string) => {
    setHelpfulCounts(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
  };

  const handleReportFake = (reviewId: string) => {
    setReportedReviews(prev => ({ ...prev, [reviewId]: true }));
    alert("Review flagged and sent to admin for validation.");
  };

  const getStarRating = (count: number) => {
    return (
      <div className="flex gap-0.5 items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < count ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Reputation Center</h1>
          <p className="text-xs text-muted-foreground">Monitor storefront satisfaction, answer queries with AI templates, and audit review analytics.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-border bg-background hover:bg-muted flex items-center gap-1.5 cursor-pointer" onClick={() => alert('Exporting monthly reviews report in CSV format...')}>
            <Download className="h-3.5 w-3.5" /> Export Report (Excel)
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-border bg-background hover:bg-muted flex items-center gap-1.5 cursor-pointer" onClick={() => alert('Exporting PDF booklet...')}>
            <Download className="h-3.5 w-3.5" /> PDF Summary
          </Button>
        </div>
      </div>

      {/* AI Alert for critical reviews */}
      {reviewsList.some(r => r.rating === 1 && !r.reply) && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5 animate-pulse text-rose-500 shrink-0" />
          <span><strong>AI Alert:</strong> 1⭐ critical review received regarding leaking Ghee bottle. Action: Offer a replacement coupon.</span>
        </div>
      )}

      {/* Reputation Health score & NPS panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scores Card */}
        <Card className="border border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-primary tracking-wider">Reputation Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs font-bold">
            <div className="flex justify-between items-center p-1 border-b border-border/30">
              <span className="text-muted-foreground">Overall Reputation</span>
              <span className="text-foreground">94%</span>
            </div>
            <div className="flex justify-between items-center p-1 border-b border-border/30">
              <span className="text-muted-foreground">Product Quality</span>
              <span className="text-foreground">96%</span>
            </div>
            <div className="flex justify-between items-center p-1 border-b border-border/30">
              <span className="text-muted-foreground">Delivery Speed</span>
              <span className="text-foreground">92%</span>
            </div>
            <div className="flex justify-between items-center p-1 border-b border-border/30">
              <span className="text-muted-foreground">Customer Support</span>
              <span className="text-foreground">95%</span>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-muted-foreground">Packaging Integrity</span>
              <span className="text-foreground">89%</span>
            </div>
          </CardContent>
        </Card>

        {/* NPS score Card */}
        <Card className="glass flex items-center justify-between p-5">
          <div className="flex flex-col text-left gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Promoter Score (NPS)</span>
            <span className="text-3xl font-black text-primary">72</span>
            <Badge variant="success" className="w-fit text-[9px] px-1.5 py-0">Excellent NPS</Badge>
          </div>
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
            <Smile className="h-6 w-6" />
          </div>
        </Card>

        {/* Avg Response stats card */}
        <Card className="glass flex items-center justify-between p-5">
          <div className="flex flex-col text-left gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Average Response Time</span>
            <span className="text-3xl font-black text-foreground">2.3 Hours</span>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Below regional average</span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'product', label: 'Product Reviews', icon: <MessageSquare className="h-3.5 w-3.5" /> },
          { id: 'store', label: 'Storefront Feedback', icon: <Star className="h-3.5 w-3.5" /> },
          { id: 'analytics', label: 'Reputation Analytics', icon: <TrendingUp className="h-3.5 w-3.5" /> }
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

      {/* Main Review Dashboard content layout */}
      {activeTab !== 'analytics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Review Filter column (Left side) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card className="glass">
              <CardHeader className="p-4 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">Filter &amp; Search</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4 text-left">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/80 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Rating Filter</label>
                  <select
                    value={selectedRatingFilter}
                    onChange={(e) => setSelectedRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none"
                  >
                    <option value="all">All Ratings</option>
                    {[5,4,3,2,1].map(r => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border/40 text-xs font-bold text-muted-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filterNoReply} 
                      onChange={(e) => setFilterNoReply(e.target.checked)} 
                      className="accent-primary"
                    />
                    <span>Unanswered Reviews</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filterWithImages} 
                      onChange={(e) => setFilterWithImages(e.target.checked)} 
                      className="accent-primary"
                    />
                    <span>Reviews with Images</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Registry feed */}
          <div className="lg:col-span-9 flex flex-col gap-4">
            {filteredReviews.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">No matches found in your review filters.</Card>
            ) : filteredReviews.map(rev => (
              <Card key={rev.id} className="border border-border/80 text-left">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xs">{rev.customerName}</span>
                        {rev.verified && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[8px] px-1.5 py-0 flex items-center gap-0.5 select-none">
                            <CheckCircle className="h-2 w-2" /> Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Sourced: <strong className="text-foreground">{rev.productName}</strong> on {rev.date}</span>
                    </div>
                    <div>{getStarRating(rev.rating)}</div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {/* Review Images thumbnail list */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2.5 mt-1">
                      {rev.images.map((img: string, i: number) => (
                        <img 
                          key={i} 
                          src={img} 
                          alt="Review attachment" 
                          onClick={() => setSelectedImage(img)}
                          className="h-14 w-14 object-cover rounded-lg border border-border/60 hover:scale-105 cursor-zoom-in transition-all shrink-0" 
                        />
                      ))}
                    </div>
                  )}

                  {/* Review Timeline Indicator */}
                  <div className="flex items-center gap-1.5 py-1 text-[9px] font-bold text-muted-foreground uppercase border-y border-border/30">
                    <span>Order</span>
                    <span>→</span>
                    <span>Delivered</span>
                    <span>→</span>
                    <span>Reviewed</span>
                    <span>→</span>
                    <span className={rev.reply ? "text-primary" : ""}>Vendor Replied</span>
                  </div>

                  {/* Reply controls */}
                  {rev.reply ? (
                    <div className="bg-secondary/45 border-l-2 border-primary p-3 rounded-r-lg flex flex-col gap-1 text-xs">
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Reply className="h-3.5 w-3.5" /> Your Store Response
                      </span>
                      <p className="text-muted-foreground mt-0.5">"{rev.reply}"</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-1">
                      {editingReplyId === rev.id ? (
                        <div className="flex flex-col gap-2.5">
                          {/* AI Reply generator templates */}
                          <div className="flex flex-wrap gap-1.5">
                            <button type="button" onClick={() => handleApplyAiReply(rev.id, "Thank you ❤️ We appreciate your support!")} className="text-[9px] font-bold bg-secondary hover:bg-secondary/80 text-foreground px-2 py-0.5 rounded cursor-pointer border border-border">✨ Thank you ❤️</button>
                            <button type="button" onClick={() => handleApplyAiReply(rev.id, "Sorry for the inconvenience. We will improve.")} className="text-[9px] font-bold bg-secondary hover:bg-secondary/80 text-foreground px-2 py-0.5 rounded cursor-pointer border border-border">✨ Sorry for inconvenience</button>
                            <button type="button" onClick={() => handleApplyAiReply(rev.id, "Please contact our support for a replacement.")} className="text-[9px] font-bold bg-secondary hover:bg-secondary/80 text-foreground px-2 py-0.5 rounded cursor-pointer border border-border">✨ Please contact support</button>
                          </div>
                          
                          <textarea
                            rows={2}
                            placeholder="Write a response..."
                            value={replyInputs[rev.id] || ''}
                            onChange={(e) => setReplyInputs(prev => ({ ...prev, [rev.id]: e.target.value }))}
                            className="w-full border border-border rounded-lg p-2 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                          <div className="flex gap-2 self-end">
                            <Button size="sm" onClick={() => handleReplySubmit(rev.id)} className="text-xs px-3 py-1 cursor-pointer">
                              Submit Reply
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingReplyId(null)} className="text-xs px-3 py-1 cursor-pointer bg-background hover:bg-muted">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingReplyId(rev.id)}
                            className="text-xs font-bold text-primary hover:bg-secondary w-fit flex items-center gap-1.5 cursor-pointer"
                          >
                            <Reply className="h-3.5 w-3.5" /> Reply to Review
                          </Button>

                          {/* Helpful and Report actions */}
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold">
                            <button 
                              onClick={() => handleHelpfulVote(rev.id)}
                              className="flex items-center gap-1 hover:text-foreground cursor-pointer border-none bg-transparent"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({helpfulCounts[rev.id] || 0})
                            </button>
                            {!reportedReviews[rev.id] ? (
                              <button 
                                onClick={() => handleReportFake(rev.id)}
                                className="hover:text-rose-500 cursor-pointer border-none bg-transparent"
                              >
                                Report Fake
                              </button>
                            ) : (
                              <span className="text-rose-500">Reported</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Analytics Tab content */
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

          {/* Product Quality scoring panels */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3 border-b border-border/40 text-left">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-emerald-500">
                  <Smile className="h-4.5 w-4.5" /> Most Loved Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/40 text-left">
                {lovedProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">No high-rated products yet.</div>
                ) : lovedProducts.map(p => (
                  <div key={p.id} className="p-3 flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="truncate max-w-[180px]">{p.name}</span>
                    <Badge variant="success">★ {p.rating?.toFixed(1) || '5.0'} Rating</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-border/40 text-left">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-destructive">
                  <Frown className="h-4.5 w-4.5" /> Lowest Rated Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/40 text-left">
                {lowestProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
                    "No low-rated products this month."
                  </div>
                ) : lowestProducts.map(p => (
                  <div key={p.id} className="p-3 flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="truncate max-w-[180px]">{p.name}</span>
                    <Badge variant="destructive">★ {p.rating?.toFixed(1)} Rating</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Image zoom modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-lg w-full relative bg-background border border-border">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-secondary/80 hover:bg-secondary cursor-pointer border-none text-foreground z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <CardContent className="p-3 flex items-center justify-center">
              <img src={selectedImage} alt="Attachment zoomed" className="max-h-[70vh] object-contain rounded-lg" />
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default ReviewsRatings;
