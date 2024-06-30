import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { TradeAggregates } from '@core/services/tradeAggregationService.models';
import { TradeAggregationService } from '@core/services/tradeAggregationService.service';
import { DetailsComponent } from './details/details.component';

@Component({
  selector: 'app-single-job',
  standalone: true,
  imports: [CommonModule, DetailsComponent],
  templateUrl: './single-job.component.html',
  styleUrls: ['./single-job.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleJobComponent {
  private tradeAggregationService = inject(TradeAggregationService);

  public details = inject(TradeAggregationService).detailsData$;
  public symbol = input.required<TradeAggregates>();

  public isExpanded = false;
  public ROW_HEIGHT = 4;

  public expandDetails(): void {
    this.isExpanded = !this.isExpanded;
  }

  public deleteGroup(): void {
    this.tradeAggregationService.deleteGroup(this.symbol().symbol);
  }

  public deleteTrade(tradeId: number): void {
    this.tradeAggregationService.deleteTrade(this.symbol().symbol, tradeId);
  }
}
