import { IObject } from '@iote/bricks';
/**
 * Represents a note attached to a budget.
 * This interface defines the structure of a budget note in the system.
 */
export interface BudgetNote extends IObject {
    /** Foreign key to the budget this note belongs to */
    budgetId: string;
    /** The content of the note */
    content: string;
    /** User ID of the person who created the note */
    createdBy: string;
    /** Timestamp when the note was created */
    createdAt: Date;
}
