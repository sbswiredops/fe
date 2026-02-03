import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function CourseNotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center px-4">
                <div className="mb-8">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Not Found</h1>
                    <p className="text-gray-600 mb-8">
                        Sorry, we couldn't find the course you're looking for. It may have been removed or doesn't exist.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Link href="/courses">
                        <Button 
                            size="lg" 
                            className="w-full"
                            style={{
                                backgroundColor: "var(--color-text-primary)",
                                borderColor: "var(--color-text-primary)",
                                color: "#fff"
                            }}
                        >
                            Browse All Courses
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full"
                            style={{
                                borderColor: "var(--color-text-primary)",
                                color: "var(--color-text-primary)",
                                backgroundColor: "rgba(80, 53, 110, 0.05)",
                            }}
                        >
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
