import React, { useState } from 'react';
import { useVendor } from '../context/VendorContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BookOpen, Video, Calendar, Award, PlayCircle, Download, CheckCircle, Clock } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  submenuId: string;
  duration: string;
  lessons: number;
  progress: number;
  tutor: string;
}

interface Webinar {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  status: 'Live' | 'Scheduled' | 'Completed';
}

interface Certificate {
  id: string;
  title: string;
  issuedOn: string;
  grade: string;
}

export const BusinessAcademy: React.FC = () => {
  const { currentPage } = useVendor();

  // All courses matching the submenus
  const [courses] = useState<Course[]>([
    { id: 'CRS-101', title: 'Product Photography Mastery', category: 'Photography', submenuId: 'acad-photography', duration: '2h 15m', lessons: 8, progress: 100, tutor: 'Meera Nair (Growth Lead)' },
    { id: 'CRS-102', title: 'Warehouse & Inventory Controls', category: 'Inventory Management', submenuId: 'acad-inventory', duration: '3h 45m', lessons: 12, progress: 45, tutor: 'Sanjay Dutt (Procurement Head)' },
    { id: 'CRS-103', title: 'B2B Sales & Wholesaling Dynamics', category: 'Sales Training', submenuId: 'acad-sales', duration: '1h 30m', lessons: 5, progress: 80, tutor: 'Ankit Goel (Operations VP)' },
    { id: 'CRS-104', title: 'Digital Marketing & Ads Campaign', category: 'Digital Marketing', submenuId: 'acad-marketing', duration: '4h 10m', lessons: 15, progress: 0, tutor: 'Sneha Roy (Ad Ops Specialist)' },
    { id: 'CRS-105', title: 'Enterprise Client Service & Retention', category: 'Customer Service', submenuId: 'acad-customer', duration: '2h 50m', lessons: 9, progress: 10, tutor: 'Vikram Mehta (CRM Principal)' },
    { id: 'CRS-106', title: 'GST Compliance & e-Invoicing Rules', category: 'GST Basics', submenuId: 'acad-gst', duration: '3h 15m', lessons: 10, progress: 95, tutor: 'CA Nitin Patel (Compliance Advisor)' },
    { id: 'CRS-107', title: 'Franchise Growth & Coverage Optimization', category: 'Franchise Connect', submenuId: 'acad-franchise', duration: '2h 10m', lessons: 7, progress: 0, tutor: 'Rajesh Shah (Franchise Lead)' },
    { id: 'CRS-108', title: 'Entrepreneur Network Expansion Tactics', category: 'Entrepreneurship', submenuId: 'acad-entrepreneurship', duration: '1h 45m', lessons: 6, progress: 0, tutor: 'Arun Bhatia (Partner Onboarding)' }
  ]);

  const [webinars] = useState<Webinar[]>([
    { id: 'WEB-12', title: 'GST e-Invoicing Compliance under Rule 48', speaker: 'CA Nitin Patel', date: '2026-06-18', time: '11:00 AM IST', status: 'Scheduled' },
    { id: 'WEB-13', title: 'Expanding Territory Franchise Coverages', speaker: 'Rajesh Shah (Mumbai Franchise Mgr)', date: 'Today', time: '04:00 PM IST', status: 'Live' }
  ]);

  const [certificates] = useState<Certificate[]>([
    { id: 'CERT-A101', title: 'Certified ApexBee Retail Specialist', issuedOn: '2026-03-15', grade: 'Grade A+' },
    { id: 'CERT-A102', title: 'Product Catalog Design Lead', issuedOn: '2026-05-18', grade: 'Grade A' }
  ]);

  const [activeVideo, setActiveVideo] = useState<Course | null>(null);
  const [joinedWebinar, setJoinedWebinar] = useState<string | null>(null);

  const handleJoinWebinar = (webinarId: string, title: string) => {
    setJoinedWebinar(webinarId);
    setTimeout(() => {
      setJoinedWebinar(null);
      alert(`Connecting to Live Webinar: "${title}". Redirecting to private Zoom streaming portal...`);
    }, 1500);
  };

  const handleDownloadCertificate = (title: string) => {
    alert(`Success! Generated PDF document: ApexBee_${title.replace(/\s+/g, '_')}_Certificate.pdf has been prepared for local download.`);
  };

  // Filter based on the selected submenu tab or show all
  const filteredCourses = courses.filter(c => {
    if (currentPage.startsWith('acad-') && currentPage !== 'acad-certs') {
      return c.submenuId === currentPage;
    }
    return true;
  });

  const isCertsView = currentPage === 'acad-certs';

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Business Academy</h1>
          <p className="text-xs text-muted-foreground">Accelerate your growth. Learn professional photography, GST regulations, warehousing inventory controls, and earn badges certifications.</p>
        </div>
      </div>

      {/* Quick Category Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button size="sm" variant={currentPage === 'acad-photography' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-photography'}>
          Photography
        </Button>
        <Button size="sm" variant={currentPage === 'acad-inventory' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-inventory'}>
          Inventory
        </Button>
        <Button size="sm" variant={currentPage === 'acad-sales' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-sales'}>
          Sales Training
        </Button>
        <Button size="sm" variant={currentPage === 'acad-marketing' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-marketing'}>
          Marketing
        </Button>
        <Button size="sm" variant={currentPage === 'acad-customer' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-customer'}>
          Customer Service
        </Button>
        <Button size="sm" variant={currentPage === 'acad-gst' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-gst'}>
          GST Basics
        </Button>
        <Button size="sm" variant={currentPage === 'acad-franchise' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-franchise'}>
          Franchise Growth
        </Button>
        <Button size="sm" variant={currentPage === 'acad-entrepreneurship' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-entrepreneurship'}>
          Entrepreneurship
        </Button>
        <Button size="sm" variant={currentPage === 'acad-certs' ? 'primary' : 'outline'} className="text-xs" onClick={() => window.location.hash = '#acad-certs'}>
          <Award className="h-3.5 w-3.5 mr-1" /> Certifications
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Columns: Courses & Videos */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Player */}
          {activeVideo && (
            <Card className="glass border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <Badge className="w-fit flex items-center gap-1"><PlayCircle className="h-3 w-3" /> Academy Stream Player</Badge>
                <CardTitle className="text-base font-extrabold text-foreground mt-1.5">{activeVideo.title}</CardTitle>
                <CardDescription>Instructor: {activeVideo.tutor} • 1080p Stream</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="aspect-video w-full rounded-lg bg-black border border-border flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 text-left">
                    <span className="text-sm font-bold text-white">Lecture 1: Fundamental Concepts & Frameworks</span>
                    <span className="text-xs text-white/70">Remaining time: 18 minutes</span>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg animate-pulse">
                    <Video className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Course Completion Progress: {activeVideo.progress}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 cursor-pointer text-xs"
                    onClick={() => setActiveVideo(null)}
                  >
                    Close Stream
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses Grid */}
          {!isCertsView && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <BookOpen className="h-4.5 w-4.5 text-primary" /> Training Courses Catalog
                </CardTitle>
                <CardDescription>Self-paced video courses for business expansion and compliance</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/40">
                <div className="divide-y divide-border/40">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-[10px] uppercase font-bold text-primary">{course.category}</span>
                        <span className="font-extrabold text-foreground text-sm">{course.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {course.lessons} chapters • {course.duration} total duration • {course.tutor}
                        </span>
                        {/* Progress bar */}
                        <div className="w-48 bg-secondary h-1 rounded-full overflow-hidden mt-1.5 flex">
                          <div style={{ width: `${course.progress}%` }} className="bg-primary h-full rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.progress === 100 ? (
                          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 mr-2">
                            <CheckCircle className="h-4 w-4" /> Finished
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-semibold mr-2">{course.progress}% completed</span>
                        )}
                        <Button
                          size="sm"
                          variant={course.progress === 100 ? 'outline' : 'primary'}
                          onClick={() => setActiveVideo(course)}
                          className="h-8 px-3 text-xs font-bold cursor-pointer"
                        >
                          {course.progress === 100 ? 'Review Lectures' : 'Resume Course'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredCourses.length === 0 && (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No courses registered for this tab. Select another category.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications Tab View */}
          {isCertsView && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-primary" /> Credentials & Certifications
                </CardTitle>
                <CardDescription>Review and download certificates you earned in Business Academy</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="border border-border/60 p-4 rounded-lg flex items-center justify-between gap-4 text-xs bg-secondary/10">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-extrabold text-foreground text-sm">{cert.title}</span>
                      <span className="text-[10px] text-muted-foreground">Cleared: {cert.issuedOn} • Evaluation Grade: {cert.grade}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 gap-1 flex items-center cursor-pointer border-border/80 text-xs font-bold"
                      onClick={() => handleDownloadCertificate(cert.title)}
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Columns: Webinars & Certifications */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Webinars schedule */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Video className="h-4.5 w-4.5 text-primary" /> Live Webinars Panel
              </CardTitle>
              <CardDescription>Join interactive lectures with policy specialists</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              {webinars.map(web => (
                <div key={web.id} className="bg-secondary/20 p-3 rounded-lg border border-border/60 flex flex-col gap-2.5 text-xs text-left">
                  <div className="flex justify-between items-start">
                    <Badge variant={web.status === 'Live' ? 'destructive' : 'default'} className={web.status === 'Live' ? 'animate-pulse' : ''}>
                      {web.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {web.date}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground">{web.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Keynote Speaker: {web.speaker} • {web.time}</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={joinedWebinar === web.id}
                    onClick={() => handleJoinWebinar(web.id, web.title)}
                    className="w-full text-xs font-bold h-8 cursor-pointer mt-1"
                  >
                    {joinedWebinar === web.id ? 'Connecting Zoom...' : web.status === 'Live' ? 'Join Live Room' : 'Register / Set Reminder'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-primary" /> Training Analytics
              </CardTitle>
              <CardDescription>Overall course performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Completed Courses</span>
                <span className="font-bold text-foreground">1</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">In Progress Courses</span>
                <span className="font-bold text-foreground">3</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Earned Badges</span>
                <span className="font-bold text-foreground">2</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Streaming Hours</span>
                <span className="font-bold text-foreground">5.8 Hrs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessAcademy;
