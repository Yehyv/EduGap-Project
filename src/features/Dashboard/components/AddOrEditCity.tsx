import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useQuery } from "@tanstack/react-query";
import { getCountriesDropdown } from "../services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddOrEditCity = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const { t } = useLanguage();

  /* ================= COUNTRIES ================= */
  const { data: countriesData } = useQuery({
    queryKey: ["getCountries"],
    queryFn: getCountriesDropdown,
  });

  const countriesOptions = countriesData?.data?.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const topicSchema = Yup.object({
    countryId: Yup.string().required(t("country_is_required")),
    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required(t("name_is_required")),
      }),
    ),
  });

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={topicSchema}
      onSubmit={(values, { resetForm }) => {
        if (JSON.stringify(initialValues) === JSON.stringify(values)) {
          Swal.fire({
            icon: "warning",
            title: t("warning"),
            text: t("you_didnt_change_the_data"),
          });
          return;
        }

        mutate(values, {
          onSuccess: () => {
            if (!isForEdit) resetForm();
          },
        });
      }}
    >
      {() => (
        <Form className="grid gap-4">
          {/* Arabic */}
          <div className="bg-white rounded-xl p-4">
            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("name_ar")}
                name="translations[0].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />

              <TextField
                label={t("name_en")}
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />

              <DropdownMenu
                label={t("country")}
                name="countryId"
                options={countriesOptions}
              />
            </div>
          </div>

          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl bg-secondary"
            >
              {isPending ? <ButtonLoader /> : t("save_city")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditCity;
