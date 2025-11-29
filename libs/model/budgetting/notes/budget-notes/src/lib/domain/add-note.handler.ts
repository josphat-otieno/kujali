import {HandlerTools } from '@iote/cqrs';
import { FunctionHandler, FunctionContext, } from '@ngfi/functions';
import { AddNoteToBudgetCommand, AddNoteToBudgetResult } from './add-note.command';
import { BudgetNote } from '../budget-note.interface';

/**
 * Generic command handler interface.
 * Defines the contract for all command handlers in the system.
 *
 * @template TCommand - The type of command this handler processes
 */

export class AddNoteToBudgetHandler extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult> {
    /**
     * Executes the AddNoteToBudgetCommand.
     *
     * @param command - The command containing the note data
     * @param tools - Handler tools including logger and repository access
     * @returns A promise that resolves to the result of the operation
     */
    public async execute(
        command: AddNoteToBudgetCommand,
        context: FunctionContext,
        tools: HandlerTools
    ): Promise<AddNoteToBudgetResult> {
        tools.Logger.log(() => `[AddNoteToBudgetHandler] Starting to add note to budget: ${command.budgetId}`);
        try {
            // Step 1: Validate the command
            if (!command.isValid()) {
                const errorMsg = 'Invalid command: All fields (budgetId, content, createdBy, createdAt) must be non-empty';
                tools.Logger.error(() => `[AddNoteToBudgetHandler] Validation failed: ${errorMsg}`);
                return {
                    success: false,
                    error: errorMsg
                };
            }
            // Additional validation: Check for empty content after trimming
            if (command.content.trim().length === 0) {
                const errorMsg = 'Note content cannot be empty ';
                tools.Logger.error(() => `[AddNoteToBudgetHandler] Validation failed: ${errorMsg}`);
                return {
                    success: false,
                    error: errorMsg
                };
            }
            // Step 2: Get the repository for budget notes
            const notesRepo = tools.getRepository<BudgetNote>(`${command.budgetId}/notes`
            );
            // Step 3: Create the note object
            const note: BudgetNote = {
                content: command.content.trim(),
                budgetId: command.budgetId,
                createdBy: command.createdBy,
                createdAt: new Date(),

            };
            tools.Logger.log(() => `[AddNoteToBudgetHandler] Creating note in repository`);
            // Step 4: Persist the note using the repository
            const createdNote = await notesRepo.create(note);
            tools.Logger.log(() => `[AddNoteToBudgetHandler] Successfully created note with ID: ${createdNote.id}`);
            return {
                success: true,
                noteId: createdNote.id
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
            tools.Logger.error(() => `[AddNoteToBudgetHandler] Error adding note: ${errorMsg}`);
            return {
                success: false,
                error: errorMsg
            };
        }
    }
}
