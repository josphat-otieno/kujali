import { HandlerTools } from '@iote/cqrs';
import { FunctionContext, FunctionHandler } from '@ngfi/functions';

import { AddNoteToBudgetCommand } from './add-note.command';

/**
 * Generic command handler interface.
 * Defines the contract for all command handlers in the system.
 *
 * @template TCommand - The type of command this handler processes
 */
