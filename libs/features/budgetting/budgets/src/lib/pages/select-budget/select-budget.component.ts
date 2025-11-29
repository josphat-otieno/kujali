
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { cloneDeep as ___cloneDeep, flatMap as __flatMap } from 'lodash';
import { combineLatest } from 'rxjs';
import { Logger } from '@iote/bricks-angular';
import { Budget, BudgetRecord, BudgetStatus, OrgBudgetsOverview } from '@app/model/finance/planning/budgets';
import { BudgetsStore, OrgBudgetsStore } from '@app/state/finance/budgetting/budgets';
import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss',
              '../../components/budget-view-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** List of all active budgets on the system. */
export class SelectBudgetPageComponent
{
  private readonly _orgBudgets$$ = inject(OrgBudgetsStore);
  private readonly _budgets$$ = inject(BudgetsStore);
  private readonly _dialog = inject(MatDialog);
  private readonly _logger = inject(Logger);

   /** Overview which contains all budgets of an organisation */
  readonly overview = signal<OrgBudgetsOverview>([] as any);
  readonly sharedBudgets = signal<any[]>([]);

  // Local state as signals
  readonly showFilter = signal(false);


  // Computed signal for combined and transformed budgets
  readonly allBudgets = computed(() => {
    const overview = this.overview();
    const budgets = this.sharedBudgets();
    const flatOverview = __flatMap(overview);
    const flatBudgets = __flatMap(budgets);
    // Transform budgets to add endYear
    const transformedBudgets = flatBudgets.map((budget: any) => ({
      ...budget,
      endYear: budget.startYear + budget.duration - 1
    }));
    return {
      overview: flatOverview,
      budgets: transformedBudgets
    };
  });

    constructor() {
    // Subscribe to observables and update signals
    // This is the Angular 15 way to bridge observables to signals
    combineLatest([
      this._orgBudgets$$.get(),
      this._budgets$$.get()
    ]).subscribe(([overview, budgets]) => {
      this.overview.set(overview);
      this.sharedBudgets.set(budgets);
      if (budgets.length > 0) {
        this._logger.log(() => `Loaded ${budgets.length} budgets`);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  fieldsFilter(value: (Invoice) => boolean) {
    // this.filter$$.next(value);
  }
  toogleFilter(value: boolean) {
    this.showFilter.set(value);
  }
  openDialog(parent: Budget | false): void {
    const dialog = this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false
    });
    dialog.afterClosed().subscribe(() => {
      // Dialog after action
    })
  }
  /**
   * @TODO - Review and fix
   * Returns true if the budget can be activated */
  canPromote(record: BudgetRecord) {
    // Get's set on Budget Read from user privileges and budget status.
    return (record.budget as any).canBeActivated;
  }
  /** Activate budget -> Promote to be used in  */
  setActive(record: BudgetRecord) {
    const toSave = ___cloneDeep(record.budget);
    // Clean up budget record values.
    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;
    // Set Active
    toSave.status = BudgetStatus.InUse;
    (<any>record).updating = true;
    // Fire update
    this._budgets$$.update(toSave)
      .subscribe(() => {
        (<any>record).updating = false;
        this._logger.log(() => `Updated Budget with id ${toSave.id}. Set as an active budget for this org.`)
      });
  }
}
