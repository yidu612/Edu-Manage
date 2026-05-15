"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/(src)/components/layout/Header";
import { Footer } from "@/app/(src)/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Star, Calendar, Users, ExternalLink } from "lucide-react";

// Expanded Mock data (12 Projects)
const publicProjects = [
  {
    id: "1",
    title: "AI-Powered Student Performance Analytics",
    description: "A machine learning system that analyzes student academic performance using historical data and engagement metrics to provide personalized learning recommendations.",
    department: "Computer Science",
    year: "2024",
    team: ["Alice Chen", "Bob Wilson", "Carol Davis"],
    rating: 4.8,
    tags: ["Machine Learning", "Education", "Data Science"],
  },
  {
    id: "2",
    title: "Sustainable Campus Energy Management",
    description: "Implementation of IoT sensors and smart grid technology to optimize energy consumption across university facilities, reducing carbon footprint by 30%.",
    department: "Engineering",
    year: "2024",
    team: ["Emma Johnson", "Frank Miller"],
    rating: 4.6,
    tags: ["IoT", "Sustainability", "Smart Grid"],
  },
  {
    id: "3",
    title: "Blockchain-Based Academic Credentials",
    description: "A secure, decentralized system for issuing and verifying university degrees and certifications to prevent fraud and simplify background checks.",
    department: "Computer Science",
    year: "2024",
    team: ["David Lee", "Grace Kim", "Henry Brown"],
    rating: 4.9,
    tags: ["Blockchain", "Security", "Web3"],
  },
  {
    id: "4",
    title: "Virtual Reality History Experience",
    description: "Creating immersive VR environments that allow students to explore historical sites and civilizations interactively through high-fidelity 3D modeling.",
    department: "Digital Media",
    year: "2023",
    team: ["Liam Anderson", "Mia Thompson"],
    rating: 4.5,
    tags: ["VR", "History", "3D Modeling"],
  },
  {
    id: "5",
    title: "Autonomous Delivery Drone for Campus",
    description: "Design and construction of an autonomous drone system capable of delivering small packages between campus departments using computer vision.",
    department: "Engineering",
    year: "2024",
    team: ["Noah Martinez", "Olivia Robinson"],
    rating: 4.7,
    tags: ["Robotics", "AI", "Engineering"],
  },
  {
    id: "6",
    title: "Urban Air Quality Monitoring Network",
    description: "A mesh network of low-cost sensors deployed around the city to provide real-time, street-level air quality data for environmental research.",
    department: "Information Systems",
    year: "2023",
    team: ["Sam Lewis", "Rachel Clark"],
    rating: 4.4,
    tags: ["Environment", "Sensors", "Data Viz"],
  },
  {
    id: "7",
    title: "Fintech Micro-Investment Platform",
    description: "An accessible mobile application designed to teach students financial literacy through controlled, low-risk micro-investment portfolios.",
    department: "Business",
    year: "2024",
    team: ["James Taylor", "Kate Williams"],
    rating: 4.6,
    tags: ["Fintech", "Mobile App", "Finance"],
  },
  {
    id: "8",
    title: "AI Radiology Diagnostic Assistant",
    description: "A deep learning tool designed to assist radiologists by highlighting potential anomalies in X-ray and MRI scans with high precision.",
    department: "Medicine & Health",
    year: "2024",
    team: ["Dr. Aris V.", "Sarah P.", "Mike R."],
    rating: 4.9,
    tags: ["HealthTech", "AI", "Medicine"],
  },
  {
    id: "9",
    title: "Smart Traffic Flow Optimization",
    description: "Using real-time traffic camera data and AI to optimize traffic light timing in congested urban areas to reduce wait times and emissions.",
    department: "Civil Engineering",
    year: "2023",
    team: ["Kevin H.", "Laura S."],
    rating: 4.3,
    tags: ["Smart City", "AI", "Optimization"],
  },
  {
    id: "10",
    title: "Psychological Impact of Remote Learning",
    description: "A data-driven study analyzing the long-term mental health effects of remote education on university students during 2020-2022.",
    department: "Psychology",
    year: "2023",
    team: ["Isabella G.", "Peter W.", "Quinn H."],
    rating: 4.5,
    tags: ["Social Science", "Data Analysis"],
  },
  {
    id: "11",
    title: "AR Language Learning Interface",
    description: "An Augmented Reality application that labels real-world objects in foreign languages to enhance vocabulary acquisition through immersion.",
    department: "Digital Media",
    year: "2024",
    team: ["Victor M.", "Yuna K."],
    rating: 4.7,
    tags: ["AR", "Language", "Education"],
  },
  {
    id: "12",
    title: "Zero-Waste Campus Circular Economy",
    description: "A logistical framework and application to manage campus waste and promote resource sharing among students to reach a zero-waste goal.",
    department: "Sustainability",
    year: "2024",
    team: ["Elena F.", "Marcus J."],
    rating: 4.8,
    tags: ["Sustainability", "Logistics", "Green"],
  }
];

const years = ["All Years", "2024", "2023", "2022"];

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = publicProjects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.team.some((t) => t.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    const matchesYear = yearFilter === 'All Years' || p.year === yearFilter;
    return matchesSearch && matchesYear;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b bg-muted/30 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Public Project Archive
              </h1>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                Explore <span className="text-primary font-semibold">{publicProjects.length}</span> approved student projects. 
                Innovative solutions driving academic excellence.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mx-auto mt-10 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-4 sm:flex-row p-3 bg-white rounded-3xl shadow-xl shadow-primary/5 border">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search by title, team or tags..." 
                    className="pl-11 rounded-2xl border-none bg-muted/50 h-12 focus-visible:ring-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full sm:w-36 rounded-2xl border-none bg-muted/50 h-12">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Featured Projects</h2>
                <p className="text-sm text-muted-foreground">
                  {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <Button variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5 h-10">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-16">No projects match your search.</p>
              ) : visible.map((project, index) => (
                <Card 
                  key={project.id} 
                  className="animate-in fade-in slide-in-from-bottom-6 flex flex-col group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-primary/10 overflow-hidden"
                  style={{ 
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none font-bold px-2 py-0.5">
                        {project.department}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span>{project.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors leading-snug">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-sm leading-relaxed mt-2 text-muted-foreground/80">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold bg-muted px-2 py-1 rounded-md text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between border-t border-muted pt-4 text-xs">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {project.year}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {project.team.length} Team
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button 
                      variant="default" 
                      className="w-full rounded-2xl gap-2 h-11 font-bold group-hover:shadow-lg transition-all"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      Explore Project
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination / Load More */}
            <div className="mt-20 text-center space-y-4">
              <p className="text-sm text-muted-foreground font-medium">
                Viewing {visible.length} of {filtered.length} projects
              </p>
              {hasMore && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-12 h-14 border-primary/30 hover:bg-primary/5 text-primary font-bold"
                  onClick={() => setVisibleCount((c) => c + 6)}
                >
                  View All Archives
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}