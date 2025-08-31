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
  ArrowRight,
  X
} from 'lucide-react';

// Import mangrove photos
import mangroveAerial from '@/assets/mangrove-aerial.jpg';
import mangroveHero from '@/assets/hero-mangroves.jpg';
import mangroveIcon from '@/assets/mangrove-shield-icon.png';

const Education = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [selectedPhotoTitle, setSelectedPhotoTitle] = useState('');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const { courses: dbCourses, quizzes: dbQuizzes, guides: dbGuides, loading } = useEducation();

  // Function to handle button clicks and show photos
  const handleButtonClick = (action: string, title: string) => {
    let photo = '';
    let photoTitle = '';
    
    switch (action) {
      case 'start_course':
        photo = mangroveAerial;
        photoTitle = 'Mangrove Ecosystem - Aerial View';
        break;
      case 'continue_course':
        photo = mangroveHero;
        photoTitle = 'Mangrove Conservation in Action';
        break;
      case 'view_certificate':
        photo = mangroveIcon;
        photoTitle = 'Mangrove Guardian Certificate';
        break;
      case 'start_quiz':
        photo = mangroveAerial;
        photoTitle = 'Mangrove Knowledge Test';
        break;
      case 'download_guide':
        photo = mangroveHero;
        photoTitle = 'Mangrove Field Guide';
        break;
      default:
        photo = mangroveAerial;
        photoTitle = 'Mangrove Education';
    }
    
    setSelectedPhoto(photo);
    setSelectedPhotoTitle(photoTitle);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto('');
    setSelectedPhotoTitle('');
  };

  const startQuiz = (quiz: any) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setQuizScore(0);
    setShowQuizModal(true);
  };

  const closeQuizModal = () => {
    setShowQuizModal(false);
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setQuizScore(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questionsList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      calculateScore();
      setQuizCompleted(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === currentQuiz.questionsList[index].correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / currentQuiz.questionsList.length) * 100);
    setQuizScore(score);
  };

  const retakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setQuizScore(0);
  };

  // Handle ESC key press
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPhotoModal) closePhotoModal();
        if (showQuizModal) closeQuizModal();
      }
    };

    if (showPhotoModal || showQuizModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showPhotoModal, showQuizModal]);

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
      difficulty: 'Medium',
      questionsList: [
        {
          question: "Which mangrove species is known for its distinctive 'prop roots' that arch above the water?",
          options: ["Red Mangrove (Rhizophora mangle)", "Black Mangrove (Avicennia germinans)", "White Mangrove (Laguncularia racemosa)", "Buttonwood (Conocarpus erectus)"],
          correctAnswer: 0,
          explanation: "Red Mangroves have distinctive prop roots that arch above the water surface, providing stability and oxygen exchange."
        },
        {
          question: "What is the primary function of pneumatophores in mangrove trees?",
          options: ["Water absorption", "Oxygen absorption", "Nutrient storage", "Seed dispersal"],
          correctAnswer: 1,
          explanation: "Pneumatophores are specialized roots that grow upward from the soil to absorb oxygen in waterlogged conditions."
        },
        {
          question: "Which mangrove species is most salt-tolerant?",
          options: ["White Mangrove", "Black Mangrove", "Red Mangrove", "All are equally salt-tolerant"],
          correctAnswer: 2,
          explanation: "Red Mangroves are the most salt-tolerant and can be found closest to the ocean."
        },
        {
          question: "What is the scientific name for the Black Mangrove?",
          options: ["Rhizophora mangle", "Avicennia germinans", "Laguncularia racemosa", "Bruguiera gymnorrhiza"],
          correctAnswer: 1,
          explanation: "Avicennia germinans is the scientific name for the Black Mangrove."
        },
        {
          question: "Which mangrove species produces 'pencil roots'?",
          options: ["Red Mangrove", "Black Mangrove", "White Mangrove", "Buttonwood"],
          correctAnswer: 1,
          explanation: "Black Mangroves produce pencil-like pneumatophores that extend above the soil surface."
        }
      ]
    },
    {
      id: 2,
      title: 'Threat Assessment Challenge',
      questions: 20,
      timeLimit: '15 min',
      bestScore: 94,
      attempts: 2,
      points: 200,
      difficulty: 'Hard',
      questionsList: [
        {
          question: "What is the most significant threat to mangrove ecosystems globally?",
          options: ["Climate change", "Deforestation for aquaculture", "Pollution", "Invasive species"],
          correctAnswer: 1,
          explanation: "Deforestation for aquaculture (shrimp farming) is the leading cause of mangrove loss worldwide."
        },
        {
          question: "How do rising sea levels affect mangrove ecosystems?",
          options: ["They always benefit mangroves", "They can cause mangrove migration inland", "They have no effect", "They only affect young trees"],
          correctAnswer: 1,
          explanation: "Rising sea levels can cause mangroves to migrate inland, but this is limited by human development."
        },
        {
          question: "What type of pollution is most harmful to mangrove roots?",
          options: ["Air pollution", "Oil spills", "Plastic waste", "Noise pollution"],
          correctAnswer: 1,
          explanation: "Oil spills coat mangrove roots, preventing oxygen absorption and causing suffocation."
        },
        {
          question: "Which human activity directly destroys mangrove habitats?",
          options: ["Fishing", "Tourism", "Urban development", "Bird watching"],
          correctAnswer: 2,
          explanation: "Urban development directly removes mangrove forests and replaces them with buildings and infrastructure."
        },
        {
          question: "What is the impact of climate change on mangrove flowering patterns?",
          options: ["No change", "Earlier flowering", "Later flowering", "Complete cessation of flowering"],
          correctAnswer: 1,
          explanation: "Climate change can cause mangroves to flower earlier, disrupting pollination cycles."
        }
      ]
    },
    {
      id: 3,
      title: 'Conservation Methods Test',
      questions: 10,
      timeLimit: '8 min',
      bestScore: null,
      attempts: 0,
      points: 100,
      difficulty: 'Easy',
      questionsList: [
        {
          question: "What is the most effective method for mangrove restoration?",
          options: ["Planting any mangrove species", "Using native species from local sources", "Importing exotic species", "Artificial propagation only"],
          correctAnswer: 1,
          explanation: "Using native species from local sources ensures better survival and ecosystem compatibility."
        },
        {
          question: "How can communities help protect mangrove forests?",
          options: ["By cutting them down for firewood", "By establishing marine protected areas", "By building resorts nearby", "By ignoring them"],
          correctAnswer: 1,
          explanation: "Establishing marine protected areas helps conserve mangrove ecosystems and their biodiversity."
        },
        {
          question: "What is the best approach to mangrove conservation?",
          options: ["Protection only", "Restoration only", "Combined protection and restoration", "Commercial exploitation"],
          correctAnswer: 2,
          explanation: "A combined approach of protecting existing mangroves and restoring degraded areas is most effective."
        },
        {
          question: "Why is education important for mangrove conservation?",
          options: ["It's not important", "It increases awareness and community involvement", "It only benefits scientists", "It's required by law"],
          correctAnswer: 1,
          explanation: "Education increases public awareness and encourages community involvement in conservation efforts."
        },
        {
          question: "What role do mangroves play in climate change mitigation?",
          options: ["No role", "They absorb CO2 and store carbon", "They only provide shade", "They increase temperatures"],
          correctAnswer: 1,
          explanation: "Mangroves are excellent carbon sinks, absorbing CO2 and storing carbon in their biomass and soil."
        }
      ]
    }
  ];

  const guides = [
    {
      title: 'Field Guide: Mangrove Species',
      description: 'Comprehensive visual guide to identifying mangrove species worldwide.',
      pages: 45,
      downloads: 2340,
      category: 'Identification',
      featured: true,
      googleLink: 'https://www.google.com/search?q=mangrove+species+identification+guide+field+manual'
    },
    {
      title: 'Threat Assessment Handbook',
      description: 'Step-by-step guide for assessing and reporting environmental threats.',
      pages: 28,
      downloads: 1890,
      category: 'Assessment',
      featured: false,
      googleLink: 'https://www.google.com/search?q=mangrove+ecosystem+threat+assessment+conservation'
    },
    {
      title: 'Conservation Best Practices',
      description: 'Evidence-based conservation strategies for mangrove protection.',
      pages: 38,
      downloads: 1567,
      category: 'Conservation',
      featured: true,
      googleLink: 'https://www.google.com/search?q=mangrove+conservation+best+practices+restoration+methods'
    },
    {
      title: 'Mangrove Ecology Research',
      description: 'Latest research findings on mangrove ecosystem dynamics and biodiversity.',
      pages: 52,
      downloads: 1234,
      category: 'Research',
      featured: false,
      googleLink: 'https://www.google.com/search?q=mangrove+ecology+research+papers+studies'
    },
    {
      title: 'Community Engagement Guide',
      description: 'How to involve local communities in mangrove conservation efforts.',
      pages: 31,
      downloads: 987,
      category: 'Community',
      featured: false,
      googleLink: 'https://www.google.com/search?q=mangrove+community+engagement+conservation+programs'
    },
    {
      title: 'Climate Change & Mangroves',
      description: 'Understanding the impact of climate change on mangrove ecosystems.',
      pages: 41,
      downloads: 1456,
      category: 'Climate',
      featured: true,
      googleLink: 'https://www.google.com/search?q=climate+change+mangrove+ecosystems+impact+adaptation'
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
                        onClick={() => {
                          if (course.completed) {
                            handleButtonClick('view_certificate', course.title);
                          } else if (course.progress > 0) {
                            handleButtonClick('continue_course', course.title);
                          } else {
                            handleButtonClick('start_course', course.title);
                          }
                        }}
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

                      <Button 
                        variant="ocean" 
                        className="w-full" 
                        onClick={() => startQuiz(quiz)}
                      >
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
                      <Button variant="ocean" className="flex-1" onClick={() => handleButtonClick('download_guide', guide.title)}>
                        Download PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(guide.googleLink, '_blank')}
                        title={`Search "${guide.title}" on Google`}
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                      >
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

      {/* Photo Modal */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closePhotoModal}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
              <h3 className="text-xl font-semibold text-primary">{selectedPhotoTitle}</h3>
              <button 
                onClick={closePhotoModal} 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <img 
                src={selectedPhoto} 
                alt={selectedPhotoTitle} 
                className="w-full h-auto object-contain rounded-lg shadow-lg" 
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Click outside or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && currentQuiz && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeQuizModal}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">{currentQuiz.title}</h3>
                <p className="text-blue-700 mt-1">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questionsList.length}
                </p>
              </div>
              <button 
                onClick={closeQuizModal} 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              {!quizCompleted ? (
                <div className="space-y-6">
                  {/* Question */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {currentQuiz.questionsList[currentQuestionIndex].question}
                    </h4>
                    
                    {/* Answer Options */}
                    <div className="space-y-3">
                      {currentQuiz.questionsList[currentQuestionIndex].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                            userAnswers[currentQuestionIndex] === index
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      {userAnswers.filter(answer => answer !== undefined).length} of {currentQuiz.questionsList.length} answered
                    </div>
                    
                    <Button
                      onClick={nextQuestion}
                      disabled={userAnswers[currentQuestionIndex] === undefined}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {currentQuestionIndex === currentQuiz.questionsList.length - 1 ? 'Finish Quiz' : 'Next'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Quiz Results */
                <div className="text-center space-y-6">
                  <div className="text-6xl mb-4">
                    {quizScore >= 80 ? '🎉' : quizScore >= 60 ? '👍' : '📚'}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900">
                    Quiz Completed!
                  </h3>
                  
                  <div className="text-4xl font-bold text-blue-600">
                    {quizScore}%
                  </div>
                  
                  <p className="text-gray-600">
                    You answered {Math.round((quizScore / 100) * currentQuiz.questionsList.length)} out of {currentQuiz.questionsList.length} questions correctly.
                  </p>
                  
                  {quizScore >= 80 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        🏆 Excellent! You've mastered this topic!
                      </p>
                    </div>
                  )}
                  
                  {quizScore >= 60 && quizScore < 80 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 font-medium">
                        📖 Good job! Keep learning to improve further.
                      </p>
                    </div>
                  )}
                  
                  {quizScore < 60 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium">
                        📚 Don't worry! Review the material and try again.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                    <Button onClick={retakeQuiz} variant="outline">
                      Retake Quiz
                    </Button>
                    <Button onClick={closeQuizModal} className="bg-blue-600 hover:bg-blue-700">
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Education;