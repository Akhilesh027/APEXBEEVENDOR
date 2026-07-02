import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BookOpen, Video, Calendar, Award, PlayCircle, Download, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
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

export const Training: React.FC = () => {
  const [courses] = useState<Course[]>([
    { id: 'CRS-01', title: 'Partner Catalog Optimization', category: 'Catalog Management', duration: '2h 15m', lessons: 8, progress: 100, tutor: 'Meera Nair (Growth Lead)' },
    { id: 'CRS-02', title: 'RFQ Bidding & Wholesaling Dynamics', category: 'Wholesale Bidding', duration: '3h 45m', lessons: 12, progress: 45, tutor: 'Sanjay Dutt (Procurement Head)' },
    { id: 'CRS-03', title: 'Logistics SLA & Secure Packaging', category: 'Fulfillment', duration: '1h 30m', lessons: 5, progress: 0, tutor: 'Ankit Goel (Operations VP)' }
  ]);

  const [webinars] = useState<Webinar[]>([
    { id: 'WEB-12', title: 'GST e-Invoicing Compliance under Rule 48', speaker: 'CA Nitin Patel', date: '2026-06-18', time: '11:00 AM IST', status: 'Scheduled' },
    { id: 'WEB-13', title: 'Expanding Territory Franchise Coverages', speaker: 'Rajesh Shah (Mumbai Franchise Mgr)', date: 'Today', time: '04:00 PM IST', status: 'Live' }
  ]);

  const [certificates] = useState<Certificate[]>([
    { id: 'CERT-A101', title: 'Certified ApexBee Retail Specialist', issuedOn: '2026-03-15', grade: 'Grade A+' }
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

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full text-foreground text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">Training & Partner Enablement</h1>
          <p className="text-xs text-muted-foreground">Learn catalog optimization tips, join tax compliance webinars, and download credentials certifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Columns: Courses & Videos */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Player */}
          {activeVideo && (
            <Card className="glass border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <Badge className="w-fit flex items-center gap-1"><PlayCircle className="h-3 w-3" /> E-learning Player</Badge>
                <CardTitle className="text-base font-extrabold text-foreground mt-1.5">{activeVideo.title}</CardTitle>
                <CardDescription>Instructor: {activeVideo.tutor} • 1080p Stream</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="aspect-video w-full rounded-lg bg-black border border-border flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 text-left">
                    <span className="text-sm font-bold text-white">Lesson 3: Optimizing High-Resolution Mockups</span>
                    <span className="text-xs text-white/70">Remaining time: 14 minutes</span>
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
                    Close Player
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses Grid */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-primary" /> Training Courses Catalog
              </CardTitle>
              <CardDescription>Self-paced video courses for business expansion</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/40">
              <div className="divide-y divide-border/40">
                {courses.map(course => (
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
              </div>
            </CardContent>
          </Card>
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

          {/* Certifications Card */}
          <Card className="glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-primary" /> Credentials & Certs
              </CardTitle>
              <CardDescription>Showcase your verified compliance credentials</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {certificates.map(cert => (
                <div key={cert.id} className="border border-border/60 p-3 rounded-lg flex items-center justify-between gap-3 text-xs">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-extrabold text-foreground">{cert.title}</span>
                    <span className="text-[10px] text-muted-foreground">Cleared: {cert.issuedOn} • {cert.grade}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer border-border/80"
                    onClick={() => handleDownloadCertificate(cert.title)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <div className="text-[10px] text-muted-foreground leading-normal italic text-center mt-1">
                "Complete the Wholesaling Dynamics course to unlock the Gold Tier Bidding certificate."
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Training;
