import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVlUptakeAmongAlhivEnrolledInOtzBySexQuery } from '../impl/get-vl-uptake-among-alhiv-enrolled-in-otz-by-sex.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOtzEnrollments } from '../../entities/fact-trans-otz-enrollments.model';
import { Repository } from 'typeorm';

@QueryHandler(GetVlUptakeAmongAlhivEnrolledInOtzBySexQuery)
export class GetVlUptakeAmongAlhivEnrolledInOtzBySexHandler implements IQueryHandler<GetVlUptakeAmongAlhivEnrolledInOtzBySexQuery> {
    constructor(
        @InjectRepository(FactTransOtzEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzEnrollments>
    ) {
    }

    async execute(query: GetVlUptakeAmongAlhivEnrolledInOtzBySexQuery): Promise<any> {
        const vlUptakeAmongAlHivEnrolledInOtzBySex = this.repository.createQueryBuilder('f')
            .select(['[Gender], COUNT([lastVL]) lastVL, SUM([EligibleVL]) eligibleVL, COUNT([lastVL]) * 100.0/ SUM([EligibleVL]) as vl_uptake_percent'])
            .andWhere('f.OTZEnrollmentDate IS NOT NULL');

        if (query.county) {
            vlUptakeAmongAlHivEnrolledInOtzBySex.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            vlUptakeAmongAlHivEnrolledInOtzBySex.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            vlUptakeAmongAlHivEnrolledInOtzBySex.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            vlUptakeAmongAlHivEnrolledInOtzBySex.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            vlUptakeAmongAlHivEnrolledInOtzBySex.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.datimAgeGroup) {
            vlUptakeAmongAlHivEnrolledInOtzBySex.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }

        if (query.gender) {
            vlUptakeAmongAlHivEnrolledInOtzBySex.andWhere('f.Gender IN (:...genders)', { genders: query.gender });
        }

        return await vlUptakeAmongAlHivEnrolledInOtzBySex
            .groupBy('Gender')
            .getRawMany();
    }
}
