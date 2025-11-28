import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await userService.register({ email, password, name });
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle Prisma errors
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Handle other errors
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({ 
        error: error.message || 'Failed to register user' 
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await userService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Invalid credentials' });
    }
  },

  async getMe(req: any, res: Response) {
    try {
      const userId = req.userId;
      const user = await userService.getById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  async updateProfile(req: any, res: Response) {
    try {
      const userId = req.userId;
      const { name, email } = req.body;

      if (!name && !email) {
        return res.status(400).json({ error: 'At least one field (name or email) is required' });
      }

      const updatedUser = await userService.update(userId, { name, email });
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  },
};

