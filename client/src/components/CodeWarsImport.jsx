import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';

const CodeWarsImport = ({ onImportQuestion }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({
        difficulty: 'all',
        language: 'all',
        tags: []
    });
    const [selectedTags, setSelectedTags] = useState([]);
    const [previewChallenge, setPreviewChallenge] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const { toast } = useToast();

    const difficulties = [
        { value: '8 kyu', label: '8 kyu (Beginner)' },
        { value: '7 kyu', label: '7 kyu (Beginner)' },
        { value: '6 kyu', label: '6 kyu (Easy)' },
        { value: '5 kyu', label: '5 kyu (Easy)' },
        { value: '4 kyu', label: '4 kyu (Intermediate)' },
        { value: '3 kyu', label: '3 kyu (Intermediate)' },
        { value: '2 kyu', label: '2 kyu (Hard)' },
        { value: '1 kyu', label: '1 kyu (Hard)' }
    ];

    const languages = [
        'javascript', 'python', 'java', 'csharp', 'cpp', 'ruby', 'go', 'haskell'
    ];

    const popularTags = [
        'Algorithms', 'Fundamentals', 'Logic', 'Strings', 'Arrays', 
        'Mathematics', 'Data Structures', 'Control Flow', 'Basic Language Features'
    ];

    const searchChallenges = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchParams.difficulty && searchParams.difficulty !== 'all') params.append('difficulty', searchParams.difficulty);
            if (searchParams.language && searchParams.language !== 'all') params.append('language', searchParams.language);
            selectedTags.forEach(tag => params.append('tags', tag));

            const response = await fetch(`${import.meta.env.VITE_API_URL}/codewars/search?${params}`);
            const data = await response.json();

            if (data.success) {
                setChallenges(data.challenges);
                toast({
                    title: "Search completed",
                    description: `Found ${data.count} challenges`,
                });
            } else {
                toast({
                    title: "Search failed",
                    description: data.error,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to search challenges",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewChallenge = async (challengeId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/codewars/challenge/${challengeId}`);
            const data = await response.json();

            if (data.success) {
                setPreviewChallenge(data.challenge);
                setPreviewOpen(true);
            } else {
                toast({
                    title: "Preview failed",
                    description: data.error,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load challenge preview",
                variant: "destructive"
            });
        }
    };

    const importChallenge = async (challengeId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/codewars/import/${challengeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                onImportQuestion(data.question);
                setPreviewOpen(false);
                toast({
                    title: "Challenge imported",
                    description: "Challenge has been added to your assessment",
                });
            } else {
                toast({
                    title: "Import failed",
                    description: data.error,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to import challenge",
                variant: "destructive"
            });
        }
    };

    const handleTagToggle = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    useEffect(() => {
        setSearchParams(prev => ({
            ...prev,
            tags: selectedTags
        }));
    }, [selectedTags]);

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>Import from CodeWars</span>
                        <Badge variant="secondary">Beta</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select 
                                value={searchParams.difficulty} 
                                onValueChange={(value) => setSearchParams(prev => ({ ...prev, difficulty: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All difficulties</SelectItem>
                                    {difficulties.map(diff => (
                                        <SelectItem key={diff.value} value={diff.value}>
                                            {diff.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="language">Language</Label>
                            <Select 
                                value={searchParams.language} 
                                onValueChange={(value) => setSearchParams(prev => ({ ...prev, language: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All languages</SelectItem>
                                    {languages.map(lang => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {popularTags.slice(0, 6).map(tag => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => handleTagToggle(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={searchChallenges} 
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Searching..." : "Search Challenges"}
                    </Button>

                    {/* Results */}
                    {challenges.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Found Challenges</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {challenges.map((challenge, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{challenge.question.split('\n')[0]}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {challenge.question.length > 100 
                                                        ? challenge.question.substring(0, 100) + '...'
                                                        : challenge.question
                                                    }
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline">{challenge.difficulty}</Badge>
                                                    {challenge.tags.slice(0, 3).map(tag => (
                                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePreviewChallenge(challenge.codewars_id)}
                                                >
                                                    Preview
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => importChallenge(challenge.codewars_id)}
                                                >
                                                    Import
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Challenge Preview</DialogTitle>
                        <DialogDescription>
                            Review the challenge details before importing
                        </DialogDescription>
                    </DialogHeader>
                    
                    {previewChallenge && (
                        <div className="space-y-6">
                            {/* Challenge Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{previewChallenge.name}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline">{previewChallenge.rank?.name || 'Unknown'}</Badge>
                                        <Badge variant="secondary">{previewChallenge.category}</Badge>
                                        {previewChallenge.languages?.slice(0, 3).map(lang => (
                                            <Badge key={lang} variant="outline">{lang}</Badge>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {previewChallenge.tags?.map(tag => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Description */}
                            <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <div className="bg-muted p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap text-sm">{previewChallenge.description}</pre>
                                </div>
                            </div>

                            <Separator />

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{previewChallenge.totalCompleted}</div>
                                    <div className="text-sm text-muted-foreground">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{previewChallenge.totalAttempts}</div>
                                    <div className="text-sm text-muted-foreground">Attempts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{previewChallenge.totalStars}</div>
                                    <div className="text-sm text-muted-foreground">Stars</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{previewChallenge.voteScore}</div>
                                    <div className="text-sm text-muted-foreground">Votes</div>
                                </div>
                            </div>

                            <Separator />

                            {/* Import Preview */}
                            <div>
                                <h4 className="font-semibold mb-2">Import Preview</h4>
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                    <div><strong>Type:</strong> Coding Challenge</div>
                                    <div><strong>Points:</strong> 10 (default)</div>
                                    <div><strong>Difficulty:</strong> {previewChallenge.rank?.name || 'Unknown'}</div>
                                    <div><strong>Languages:</strong> {previewChallenge.languages?.join(', ') || 'Unknown'}</div>
                                    <div><strong>Tags:</strong> {previewChallenge.tags?.join(', ') || 'None'}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => importChallenge(previewChallenge.id)}>
                                    Import Challenge
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CodeWarsImport; 