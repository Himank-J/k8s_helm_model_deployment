'use client'

import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

interface Prediction {
  emotion: string
  probability: string
}

export default function Home() {
  // Using existing state from lines 24-28
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showResults, setShowResults] = useState(false)

  // Using existing handlers from lines 30-92
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setSelectedImage(file)
    setPreview(URL.createObjectURL(file))
    setPredictions([])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setError('')
    
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setSelectedImage(file)
    setPreview(URL.createObjectURL(file))
    setPredictions([])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const analyzePicture = async () => {
    if (!selectedImage) return
  
    setIsLoading(true)
    setError('')
    setShowResults(false)
  
    const formData = new FormData()
    formData.append('file', selectedImage)
  
    try {
      const response = await fetch('http://0.0.0.0:8000/predict', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }
  
      const data = await response.json()
      setPredictions(data.predictions)
      setShowResults(true) // Show results after successful analysis
    } catch (err) {
      setError('Failed to analyze image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        {/* Main content wrapper - changed to flex container */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Upload section - adjusted width */}
          <div className="w-full lg:w-1/2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Upload Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-full max-w-sm">
                      {preview ? (
                        <div className="relative aspect-square w-full max-w-sm mx-auto">
                          <img
                            src={preview}
                            alt="Preview"
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="w-full max-w-xs"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Image
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            or drag and drop an image here
                          </span>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>
                  </div>
                </div>

                {/* Analyze Button - Outside upload component */}
                <Button
                  onClick={analyzePicture}
                  disabled={!selectedImage || isLoading}
                  className="w-full max-w-xs mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Image'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results section - adjusted width and visibility */}
          <div className={`w-full lg:w-1/2 ${!showResults && 'lg:flex lg:items-center lg:justify-center'}`}>
            {showResults ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {predictions.length > 0 ? (
                    <div className="space-y-6">
                      {/* Primary Prediction */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold capitalize">{predictions[0].emotion}</h3>
                            <Progress value={parseFloat(predictions[0].probability) * 100} className="h-2" />
                            <p className="text-sm text-muted-foreground">
                              {(parseFloat(predictions[0].probability) * 100).toFixed(1)}% confidence
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Secondary Predictions */}
                      <div className="space-y-4">
                        {predictions.slice(1).map((prediction, index) => (
                          <Card key={index} className="bg-secondary/5">
                            <CardContent className="py-4">
                              <div className="text-center space-y-2">
                                <h4 className="font-medium capitalize">{prediction.emotion}</h4>
                                <Progress value={parseFloat(prediction.probability) * 100} className="h-2" />
                                <p className="text-sm text-muted-foreground">
                                  {(parseFloat(prediction.probability) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Upload and analyze an image to see results
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground">
                Upload and analyze an image to see results
              </div>
            )}
          </div>
        </div>

        {/* Error Dialog */}
        <AlertDialog open={!!error}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <Button onClick={() => setError('')}>Close</Button>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}