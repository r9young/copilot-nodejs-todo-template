// Import Azure Cosmos SDK and task model
import { CosmosClient } from '@azure/cosmos';
import { Task } from '../models/task';

/**
 * This class provides a service for interacting with the Cosmos DB database.
 * It is a singleton class, so only one instance of it will ever exist.
 * @class
 * @property {CosmosClient} client - The Cosmos DB client
 * @property {any} database - The database
 * @property {any} container - The container
 * @method createTask - Create a new task
 * @method getTask - Get a task by id
 * @method getTasks - Get all tasks for a user
 * @method updateTask - Update a task
 * @method deleteTask - Delete a task
 */

export class DbService {

  private client: CosmosClient;
  private container;

  //--------//
  // The singleton instance
  private static instance: DbService;

  // Get the singleton instance
  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }
  //--------//

  constructor() {
    // Check that the environment variables are set
    if (!process.env.COSMOS_ENDPOINT || !process.env.COSMOS_KEY) {
      throw new Error('Please define COSMOS_ENDPOINT and COSMOS_KEY in your environment');
    }
    this.client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    });
    this.container = this.client
      .database('todos')
      .container('tasks');
  }

 //Get all tasks for a user based on userId
  async getTasks(userId: string) {
    const { resources } = await this.container.items
      .query({
        query: 'SELECT * FROM tasks t WHERE t.userId = @userId',
        parameters: [{ name: '@userId', value: userId }],
      })
      .fetchAll();
    return resources;
  }

  async getTask(id: string) {
    const { resource } = await this.container.item(id).read();
    return resource;
  }

  async createTask(task: Task) {
    const { resource } = await this.container.items.create(task);
    return resource;
  }

  async updateTask(id: string, task: Task) {
    const { resource } = await this.container.item(id).replace(task);
    return resource;
  }

  async deleteTask(id: string) {
    await this.container.item(id).delete();
  }
}
