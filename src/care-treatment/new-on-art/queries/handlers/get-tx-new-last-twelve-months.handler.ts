import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransNewlyStarted } from '../../entities/fact-trans-newly-started.model';
import { Repository } from 'typeorm';
import { GetTxNewLastTwelveMonthsQuery } from '../impl/get-tx-new-last-twelve-months.query';

@QueryHandler(GetTxNewLastTwelveMonthsQuery)
export class GetTxNewLastTwelveMonthsHandler implements IQueryHandler<GetTxNewLastTwelveMonthsQuery> {
    constructor(
        @InjectRepository(FactTransNewlyStarted, 'mssql')
        private readonly repository: Repository<FactTransNewlyStarted>
    ) {

    }

    async execute(query: GetTxNewLastTwelveMonthsQuery): Promise<any> {
        const txNew = this.repository.createQueryBuilder('f')
            .select(['[Start_Year] year, [StartART_Month] month, SUM([StartedART]) txNew, Gender gender'])
            .where('f.[StartedART] > 0');

        if (query.partner) {
            txNew.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.county) {
            txNew.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            txNew.andWhere('f.Subcounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            txNew.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if(query.month) {
            txNew.andWhere('f.StartART_Month = :month', { month: query.month });
        }

        if(query.year) {
            const yearVal = new Date().getFullYear();
            if(query.year == yearVal && !query.month) {
                txNew.andWhere('f.Start_Year >= :startYear', { startYear: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).getFullYear() });
            } else {
                txNew.andWhere('f.Start_Year = :startYear', { startYear: query.year });
            }
        }

        return await txNew
            .groupBy('f.[Start_Year], f.[StartART_Month], f.Gender')
            .orderBy('f.[Start_Year], f.[StartART_Month]')
            .getRawMany();
    }
}
