import { PartialType } from '@nestjs/mapped-types';
import { CloseOrderDto } from './close-order.dto';

export class UpdatePaymentDto extends PartialType(CloseOrderDto) {}
