import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { BaseService } from "src/common/base.service";
import { OrderEntity, statusDelivery } from "src/entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class DstaffService extends BaseService<OrderEntity> { 
    constructor(
        @InjectRepository(OrderEntity) private readonly orderRepository: Repository<OrderEntity>,
    ) {
        super(orderRepository);
    }

    // GET ALL ORDERS NEED TO SHIPPING
    async getAllOrderNeedToShipping(){
        var result = await this.orderRepository
        .createQueryBuilder("ORDER")
        .where(`ORDER.status_delivery = 'SHIPPING'`)
        .getMany();
        return result;
    }
    // UPDATE STATUS ORDER DELIVERED
    async updateStatusOrderDelivered(id: string){
        if(!isUUID(id)) throw new HttpException('Id is incorrect', 400);
        var order = await this.orderRepository.findOne({ where: { id: id } });
        order.status_delivery = statusDelivery.DELIVERED;
        return await this.orderRepository.save(order);
    }
    // UPDATE STATUS ORDER CANCELED
    async updateStatusOrderCanceled(id: string){
        if(!isUUID(id)) throw new HttpException('Id is incorrect', 400);
        var order = await this.orderRepository.findOne({ where: { id: id } });
        order.status_delivery = statusDelivery.CANCELED;
        return await this.orderRepository.save(order);
    }
    // UPDATE STATUS ORDER SHIPPING
    async updateStatusOrderShipping(id: string){
        if(!isUUID(id)) throw new HttpException('Id is incorrect', 400);
        var order = await this.orderRepository.findOne({ where: { id: id } });
        order.status_delivery = statusDelivery.SHIPPING;
        return await this.orderRepository.save(order);
    }
    // CHECK ORDER HAVE BEEN DELIVERED IN MONTH
    async checkOrderDeliveredInMonth(){
        var result = await this.orderRepository
        .createQueryBuilder("ORDER")
        .where(`ORDER.status_delivery = 'DELIVERED'`)
        .getMany();
        return result;
    }


}