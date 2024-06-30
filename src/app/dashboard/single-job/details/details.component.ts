import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DateFormatPipe } from '@core/pipe/date-format.pipe';
import { TradeAggregationService } from '@core/services/TradeAggregationService.service';

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
  public symbol = input.required<any>();
  public deleteID = output<number>();
}
