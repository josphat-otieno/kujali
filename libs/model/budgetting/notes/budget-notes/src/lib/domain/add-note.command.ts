/**
 * Command to add a note to a budget.
 * This class encapsulates all the data needed to add a note to a budget.
 *
 * Following the CQRS pattern, this command represents the intent to modify state
 * by adding a new note to an existing budget.
 */
export class AddNoteToBudgetCommand {
    /**
     * Creates an instance of AddNoteToBudgetCommand.
     *
     * @param budgetId - The ID of the budget to add the note to
     * @param content - The content/text of the note
     * @param createdBy - The user ID of the person creating the note
     * @param createdAt - The timestamp when the note is created (defaults to current date/time)
     */
    constructor(
        public readonly budgetId: string,
        public readonly content: string,
        public readonly createdBy: string,
        public readonly createdAt: Date = new Date()
    ) { }
    /**
     * Validates the command data.
     * @returns true if the command is valid, false otherwise
     */
    isValid(): boolean {
        return !!(
            this.budgetId &&
            this.budgetId.trim().length > 0 &&
            this.content &&
            this.content.trim().length > 0 &&
            this.createdBy &&
            this.createdBy.trim().length > 0 &&
            this.createdAt instanceof Date
        );
    }
}
/**
 * Result of adding a note to a budget.
 */
export interface AddNoteToBudgetResult {
  /** Whether the operation was successful */
  success: boolean;
   /** The ID of the created note */
  noteId?: string;
   /** Error message if the operation failed */
  error?: string;
}
