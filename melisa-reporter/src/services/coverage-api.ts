import axios from 'axios';
import { CoverageRequest } from '../types/coverage';

export class CoverageAPIService {
  private baseURL: string;

  constructor(baseURL: string = process.env.COVERAGE_API_URL || 'http://localhost:8080') {
    this.baseURL = baseURL;
  }

  async submitCoverage(coverageData: CoverageRequest) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/coverage`,
        coverageData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      console.log('Coverage data submitted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit coverage data:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/coverage/projects`);
      console.log('Connection test successful');
      return response.data;
    } catch (error: any) {
      console.error('Connection test failed:', error.message);
      throw error;
    }
  }
}
