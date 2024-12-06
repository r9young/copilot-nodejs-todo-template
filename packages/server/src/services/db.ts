// Import Azure Cosmos SDK and task model
import { CosmosClient } from '@azure/cosmos';
import { Task } from '../models/task';

/**
 * Service to interact with the Azure Cosmos DB database
 * This service is responsible for all CRUD operations on the database
 * It uses the Azure Cosmos SDK to interact with the database
 * The service is initialized with the CosmosClient and the container
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
