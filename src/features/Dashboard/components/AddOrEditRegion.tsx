import { TextField } from "@/shared/components";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import ButtonLoader from "@/shared/components/ButtonLoader";
import Swal from "sweetalert2";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useQuery } from "@tanstack/react-query";
import { getAllCities } from "../services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

const AddOrEditRegion = ({
  initialValues,
  mutate,
  isPending,
  isForEdit = false,
}) => {
  const { t } = useLanguage();

  /* ================= CITIES ================= */
  const { data: citiesData } = useQuery({
    queryKey: ["getCitites"],
    queryFn: getAllCities,
  });

  const citiesOptions = citiesData?.data?.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const topicSchema = Yup.object({
    cityId: Yup.string().required(t("cityRequired")),
    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required(t("nameRequired")),
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
            text: t("noChanges"),
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
                label={t("nameAr")}
                name="translations[0].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />

              <TextField
                label={t("nameEn")}
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] !rounded-xl bg-[#F9F8F8]"
              />

              <DropdownMenu
                label={t("city")}
                name="cityId"
                options={citiesOptions}
              />
            </div>
          </div>

          <div className="text-end mt-10">
            <button
              disabled={isPending}
              type="submit"
              className="hover:bg-secondary-dark text-white px-10 py-1.5 rounded-xl bg-secondary"
            >
              {isPending ? <ButtonLoader /> : t("saveRegion")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddOrEditRegion;
