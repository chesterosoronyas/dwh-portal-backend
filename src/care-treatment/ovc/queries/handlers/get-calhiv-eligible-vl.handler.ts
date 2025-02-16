import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCalhivEligibleVlQuery } from '../impl/get-calhiv-eligible-vl.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOvcEnrollments } from '../../entities/fact-trans-ovc-enrollments.model';
import { Repository } from 'typeorm';
import { FactTransOtzOutcome } from '../../../otz/entities/fact-trans-otz-outcome.model';

@QueryHandler(GetCalhivEligibleVlQuery)
export class GetCalhivEligibleVlHandler implements IQueryHandler<GetCalhivEligibleVlQuery> {
    constructor(
        @InjectRepository(FactTransOvcEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzOutcome>
    ) {
    }

    async execute(query: GetCalhivEligibleVlQuery): Promise<any> {
        const CALHIVEligible = this.repository.createQueryBuilder('f')
            .select(['Count (*)CALHIVEligible'])
            .andWhere('f.TXCurr=1 and EligibleVL=1');

        if (query.county) {
            CALHIVEligible.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            CALHIVEligible.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            CALHIVEligible.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            CALHIVEligible.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            CALHIVEligible.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.gender) {
            CALHIVEligible.andWhere('f.Gender IN (:...genders)', { genders: query.gender });
        }

        if (query.datimAgeGroup) {
            CALHIVEligible.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }

        return await CALHIVEligible.getRawOne();
    }
}
