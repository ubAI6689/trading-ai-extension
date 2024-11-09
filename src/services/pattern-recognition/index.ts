// src/services/pattern-recognition/index.ts
import * as tf from '@tensorflow/tfjs';

export interface PatternData {
  timestamp: number;
  price: number;
  volume: number;
}

export interface Pattern {
  type: 'double_top' | 'double_bottom' | 'head_shoulders' | 'triangle' | 'channel';
  confidence: number;
  startIndex: number;
  endIndex: number;
  predictedDirection: 'up' | 'down' | 'neutral';
  supportLevel?: number;
  resistanceLevel?: number;
}

export interface PatternAnalysis {
  patterns: Pattern[];
  timestamp: number;
}

class PatternRecognitionService {
  private model: tf.LayersModel | null = null;
  private readonly windowSize = 50; // Number of data points to analyze
  
  async initialize(): Promise<void> {
    try {
      // Load the pre-trained model
      // In production, you would host this model somewhere
      this.model = await tf.loadLayersModel('/models/pattern-recognition.json');
    } catch (error) {
      console.error('Error loading pattern recognition model:', error);
      // Initialize basic pattern detection if model fails to load
      this.model = null;
    }
  }

  private normalizeData(data: PatternData[]): tf.Tensor2D {
    const priceArray = data.map(d => d.price);
    const volumeArray = data.map(d => d.volume);
    
    // Min-max normalization
    const minPrice = Math.min(...priceArray);
    const maxPrice = Math.max(...priceArray);
    const minVolume = Math.min(...volumeArray);
    const maxVolume = Math.max(...volumeArray);
    
    const normalizedData = data.map(d => [
      (d.price - minPrice) / (maxPrice - minPrice),
      (d.volume - minVolume) / (maxVolume - minVolume)
    ]);
    
    return tf.tensor2d(normalizedData);
  }

  private detectBasicPatterns(data: PatternData[]): Pattern[] {
    const patterns: Pattern[] = [];
    const prices = data.map(d => d.price);
    
    // Simple moving average
    const sma = this.calculateSMA(prices, 20);
    
    // Basic trend detection
    const trend = this.detectTrend(sma);
    
    // Support and resistance levels
    const levels = this.findSupportResistance(prices);
    
    // Pattern detection based on price action
    if (this.isDoubleTop(prices)) {
      patterns.push({
        type: 'double_top',
        confidence: 0.75,
        startIndex: Math.max(0, prices.length - 30),
        endIndex: prices.length - 1,
        predictedDirection: 'down',
        resistanceLevel: levels.resistance
      });
    }
    
    if (this.isDoubleBottom(prices)) {
      patterns.push({
        type: 'double_bottom',
        confidence: 0.75,
        startIndex: Math.max(0, prices.length - 30),
        endIndex: prices.length - 1,
        predictedDirection: 'up',
        supportLevel: levels.support
      });
    }
    
    return patterns;
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  private detectTrend(sma: number[]): 'up' | 'down' | 'neutral' {
    const recentSMA = sma.slice(-5);
    const firstSMA = recentSMA[0];
    const lastSMA = recentSMA[recentSMA.length - 1];
    
    if (lastSMA > firstSMA * 1.02) return 'up';
    if (lastSMA < firstSMA * 0.98) return 'down';
    return 'neutral';
  }

  private findSupportResistance(prices: number[]): { support: number; resistance: number } {
    const sortedPrices = [...prices].sort((a, b) => a - b);
    return {
      support: sortedPrices[Math.floor(sortedPrices.length * 0.1)],
      resistance: sortedPrices[Math.floor(sortedPrices.length * 0.9)]
    };
  }

  private isDoubleTop(prices: number[]): boolean {
    // Basic double top detection logic
    const recentPrices = prices.slice(-30);
    const max = Math.max(...recentPrices);
    const maxIndices = recentPrices
      .map((price, index) => price > max * 0.98 ? index : -1)
      .filter(index => index !== -1);
    
    return maxIndices.length >= 2 && maxIndices[maxIndices.length - 1] - maxIndices[0] > 5;
  }

  private isDoubleBottom(prices: number[]): boolean {
    // Basic double bottom detection logic
    const recentPrices = prices.slice(-30);
    const min = Math.min(...recentPrices);
    const minIndices = recentPrices
      .map((price, index) => price < min * 1.02 ? index : -1)
      .filter(index => index !== -1);
    
    return minIndices.length >= 2 && minIndices[minIndices.length - 1] - minIndices[0] > 5;
  }

  async analyzePatterns(data: PatternData[]): Promise<PatternAnalysis> {
    let patterns: Pattern[] = [];
    
    if (this.model) {
      // Use TensorFlow model for advanced pattern recognition
      const normalizedData = this.normalizeData(data);
      const prediction = this.model.predict(normalizedData.expandDims(0)) as tf.Tensor;
      const patternProbabilities = await prediction.data();
      
      // Process model predictions
      // This would depend on how your model is structured
      // Here's a placeholder for the actual implementation
    } else {
      // Fallback to basic pattern recognition
      patterns = this.detectBasicPatterns(data);
    }
    
    return {
      patterns,
      timestamp: Date.now()
    };
  }
}

export const patternRecognition = new PatternRecognitionService();
export default patternRecognition;