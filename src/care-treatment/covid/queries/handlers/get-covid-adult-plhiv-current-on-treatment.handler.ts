import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCovidAdultPLHIVCurrentOnTreatmentQuery } from '../impl/get-covid-adult-plhiv-current-on-treatment.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransNewCohort } from '../../../new-on-art/entities/fact-trans-new-cohort.model';
import { Repository } from 'typeorm';

@QueryHandler(GetCovidAdultPLHIVCurrentOnTreatmentQuery)
export class GetCovidAdultPLHIVCurrentOnTreatmentHandler implements IQueryHandler<GetCovidAdultPLHIVCurrentOnTreatmentQuery> {
    constructor(
        @InjectRepository(FactTransNewCohort, 'mssql')
        private readonly repository: Repository<FactTransNewCohort>
    ) {
    }

    async execute(query: GetCovidAdultPLHIVCurrentOnTreatmentQuery): Promise<any> {
        const covidAdultsCurrentOnTreatment = this.repository.createQueryBuilder('f')
            .select(['Count (*) Adults'])
            .where('f.ageLV >= 15 AND f.ARTOutcome=\'V\'');

        if (query.county) {
            covidAdultsCurrentOnTreatment.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            covidAdultsCurrentOnTreatment.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            covidAdultsCurrentOnTreatment.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            covidAdultsCurrentOnTreatment.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            covidAdultsCurrentOnTreatment.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.gender) {
            covidAdultsCurrentOnTreatment.andWhere('f.Gender IN (:...genders)', { genders: query.gender });
        }

        if (query.datimAgeGroup) {
            // lacking age group
            // covidAdultsCurrentOnTreatment.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }


        return await covidAdultsCurrentOnTreatment.getRawOne();
    }
}
