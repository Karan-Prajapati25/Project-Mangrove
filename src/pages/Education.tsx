import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useEducation } from '@/hooks/useEducation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock,
  Award,
  Users,
  Leaf,
  Fish,
  Camera,
  Shield,
  Globe,
  ArrowRight
} from 'lucide-react';

const Education = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const { courses: dbCourses, quizzes: dbQuizzes, guides: dbGuides, loading } = useEducation();

  const courses = [
    {
      id: 1,
      title: 'Mangrove Ecosystem Fundamentals',
      description: 'Learn about the vital role of mangroves in coastal protection and biodiversity.',
      duration: '45 min',
      lessons: 8,
      progress: 75,
      difficulty: 'Beginner',
      icon: Leaf,
      completed: false,
      category: 'Ecology'
    },
    {
      id: 2,
      title: 'Threat Identification & Assessment',
      description: 'Master the skills to identify and assess various threats to mangrove ecosystems.',
      duration: '60 min',
      lessons: 12,
      progress: 100,
      difficulty: 'Intermediate',
      icon: Shield,
      completed: true,
      category: 'Conservation'
    },
    {
      id: 3,
      title: 'Effective Conservation Photography',
      description: 'Learn photography techniques for documenting environmental threats and conservation.',
      duration: '30 min',
      lessons: 6,
      progress: 25,
      difficulty: 'Beginner',
      icon: Camera,
      completed: false,
      category: 'Documentation'
    },
    {
      id: 4,
      title: 'Marine Species Identification',
      description: 'Identify key marine species that depend on mangrove ecosystems.',
      duration: '90 min',
      lessons: 15,
      progress: 0,
      difficulty: 'Advanced',
      icon: Fish,
      completed: false,
      category: 'Biology'
    }
  ];

  const quizzes = [
    {
      id: 1,
      title: 'Mangrove Species Quiz',
      questions: 15,
      timeLimit: '10 min',
      bestScore: 87,
      attempts: 3,
      points: 150,
      difficulty: 'Medium'
    },
    {
      id: 2,
      title: 'Threat Assessment Challenge',
      questions: 20,
      timeLimit: '15 min',
      bestScore: 94,
      attempts: 2,
      points: 200,
      difficulty: 'Hard'
    },
    {
      id: 3,
      title: 'Conservation Methods Test',
      questions: 10,
      timeLimit: '8 min',
      bestScore: null,
      attempts: 0,
      points: 100,
      difficulty: 'Easy'
    }
  ];

  const guides = [
    {
      title: 'Field Guide: Mangrove Species',
      description: 'Comprehensive visual guide to identifying mangrove species worldwide.',
      pages: 45,
      downloads: 2340,
      category: 'Identification',
      featured: true
    },
    {
      title: 'Threat Assessment Handbook',
      description: 'Step-by-step guide for assessing and reporting environmental threats.',
      pages: 28,
      downloads: 1890,
      category: 'Assessment',
      featured: false
    },
    {
      title: 'Conservation Best Practices',
      description: 'Evidence-based conservation strategies for mangrove protection.',
      pages: 38,
      downloads: 1567,
      category: 'Conservation',
      featured: true
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'success';
      case 'intermediate':
      case 'medium':
        return 'warning';
      case 'advanced':
      case 'hard':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Education Center</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Enhance your conservation knowledge with interactive courses, quizzes, and comprehensive guides 
            designed by marine biology experts.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">3/4</div>
              <div className="text-sm text-muted-foreground">Courses Started</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground">Courses Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">450</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">2</div>
              <div className="text-sm text-muted-foreground">Certificates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="courses">Interactive Courses</TabsTrigger>
            <TabsTrigger value="quizzes">Knowledge Tests</TabsTrigger>
            <TabsTrigger value="guides">Field Guides</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="grid lg:grid-cols-2 gap-6">
              {courses.map((course) => {
                const Icon = course.icon;
                return (
                  <Card key={course.id} className="group hover:shadow-strong transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-ocean rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {course.category}
                              </Badge>
                              <Badge variant={getDifficultyColor(course.difficulty) as any} className="text-xs">
                                {course.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {course.completed && (
                          <CheckCircle className="h-5 w-5 text-success" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons} lessons
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <Button 
                        variant={course.completed ? "outline" : "ocean"} 
                        className="w-full mt-4 group"
                      >
                        {course.completed ? (
                          <>
                            <Award className="h-4 w-4" />
                            View Certificate
                          </>
                        ) : course.progress > 0 ? (
                          <>
                            <Play className="h-4 w-4" />
                            Continue Course
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Start Course
                          </>
                        )}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-strong transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{quiz.title}</span>
                      <Badge variant={getDifficultyColor(quiz.difficulty) as any}>
                        {quiz.difficulty}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{quiz.questions}</div>
                          <div className="text-muted-foreground">Questions</div>
                        </div>
                        <div>
                          <div className="font-medium">{quiz.timeLimit}</div>
                          <div className="text-muted-foreground">Time Limit</div>
                        </div>
                      </div>

                      {quiz.bestScore && (
                        <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-success">Best Score</span>
                            <span className="text-lg font-bold text-success">{quiz.bestScore}%</span>
                          </div>
                          <div className="text-xs text-success/80 mt-1">
                            {quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Reward</span>
                        <div className="flex items-center gap-1 font-medium text-accent">
                          <Award className="h-4 w-4" />
                          {quiz.points} points
                        </div>
                      </div>

                      <Button variant="ocean" className="w-full">
                        {quiz.bestScore ? 'Retake Quiz' : 'Start Quiz'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <Card key={index} className={`hover:shadow-strong transition-all duration-300 ${guide.featured ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      {guide.featured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{guide.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {guide.pages} pages
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {guide.downloads.toLocaleString()} downloads
                      </div>
                    </div>

                    <Badge variant="secondary" className="mb-4">
                      {guide.category}
                    </Badge>

                    <div className="flex gap-2">
                      <Button variant="ocean" className="flex-1">
                        Download PDF
                      </Button>
                      <Button variant="outline" size="icon">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Education;