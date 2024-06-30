import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { DateFormatPipe } from '@core/pipe/date-format.pipe';
import { UpdateTrade } from '@core/services/tradeAggregationService.models';
import { TradeAggregationService } from '@core/services/tradeAggregationService.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent {
  tradeAggregationService = inject(TradeAggregationService);
  public symbol = input.required<UpdateTrade>();
  public deleteID = output<number>();
}
