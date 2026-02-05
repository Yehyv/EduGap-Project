import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  getCitiesDropdown,
  getCountriesDropdown,
  getRegionsDropdown,
  instituteDetails,
  editInstitute,
} from "@/features/Dashboard/services/dashboardApis";
import { TextField } from "@/shared/components";
import ButtonLoader from "@/shared/components/ButtonLoader";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useLanguage } from "@/shared/localization/useLanguage";
import { phoneKeys } from "@/shared/utils/globals";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";

/* ================= CITIES HANDLER ================= */
const CitiesHandler = ({ setCitiesOptions, setRegionsOptions }) => {
  const { values, setFieldValue } = useFormikContext();

  const { data } = useQuery({
    queryKey: ["getCities", values.country],
    queryFn: () => getCitiesDropdown(values.country),
    enabled: !!values.country,
  });

  useEffect(() => {
    if (values.country && data?.data) {
      // Only update when we have data
      setCitiesOptions(
        data.data.map((c) => ({
          label: c.name,
          value: c.id,
        })),
      );
    } else if (!values.country) {
      // Clear everything when no country selected
      setCitiesOptions([]);
      setRegionsOptions([]);
      setFieldValue("city", "");
      setFieldValue("region", "");
    }
  }, [
    values.country,
    data,
    setCitiesOptions,
    setRegionsOptions,
    setFieldValue,
  ]);

  return null;
};

/* ================= REGIONS HANDLER ================= */
const RegionsHandler = ({ setRegionsOptions }) => {
  const { values, setFieldValue } = useFormikContext();

  const { data } = useQuery({
    queryKey: ["getRegions", values.city],
    queryFn: () => getRegionsDropdown(values.city),
    enabled: !!values.city,
  });

  useEffect(() => {
    if (values.city && data?.data) {
      // Only update when we have data
      setRegionsOptions(
        data.data.map((r) => ({
          label: r.name,
          value: r.id,
        })),
      );
    } else if (!values.city) {
      // Clear region when no city selected
      setRegionsOptions([]);
      setFieldValue("region", "");
    }
  }, [values.city, data, setRegionsOptions, setFieldValue]);

  return null;
};

const EditInstituteDetails = () => {
  const { t } = useLanguage();
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [regionsOptions, setRegionsOptions] = useState([]);
  const { instituteId } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["getInstituteDataToUpdate", instituteId],
    queryFn: () => instituteDetails(instituteId),
  });

  /* ================= COUNTRIES ================= */
  const { data: countriesData } = useQuery({
    queryKey: ["getCountries"],
    queryFn: getCountriesDropdown,
  });

  const countriesOptions = countriesData?.data?.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editInstitute,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Institute edited successfully",
        confirmButtonColor: "#0d6efd",
      });
      queryClient.invalidateQueries({ queryKey: ["getInstituteDataToUpdate"] });
    },

    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong, please try again",
        confirmButtonColor: "#dc3545",
      });
    },
  });

  /* ================= FORM DATA BUILDER ================= */
  const buildFormData = (values) => {
    const formData = new FormData();

    formData.append("logo", values.logo);
    formData.append("image_profile", values.image_profile);
    formData.append("email", values.email);
    formData.append("phone_key", values.phoneKey);
    formData.append("phone", values.phone);
    formData.append("regionId", values.region);
    formData.append(
      "location",
      `${values.city}, ${
        countriesOptions?.find((c) => c.value === values.country)?.label
      }`,
    );

    values.translations.forEach((item, index) => {
      formData.append(`translations[${index}][name]`, item.name);
      formData.append(`translations[${index}][address]`, item.address);
      formData.append(`translations[${index}][languageId]`, item.languageId);

      formData.append(
        `translations[${index}][contactPersopnName]`,
        values.contact_person_name,
      );
      formData.append(
        `translations[${index}][contactPersonPostion]`,
        values.contact_person_position,
      );
    });

    return formData;
  };

  /* ================= VALIDATION ================= */
  const instituteSchema = Yup.object({
    logo: Yup.mixed().required(),
    image_profile: Yup.mixed().required(),
    email: Yup.string().email().required(),
    phoneKey: Yup.string().required(),
    phone: Yup.string().required(),
    country: Yup.string().required(),
    city: Yup.string().required(),
    region: Yup.string().required(),
    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required(),
        address: Yup.string().required(),
      }),
    ),
  });

  const instituteData = data?.data;
  const instituteDataAr = instituteData?.translations[0];
  const instituteDataEn = instituteData?.translations[1];

  if (isLoading) return <CircleLoader />;

  return (
    <>
      <DashboardPageTitle
        text={`Edit Institute ${instituteData?.translation?.name ?? ""}`}
      />
      <Formik
        initialValues={{
          logo: instituteData?.logo,
          image_profile: instituteData?.image_profile,
          email: instituteData?.email,
          phoneKey: instituteData?.phone_key,
          phone: instituteData?.phone,
          country: instituteData?.region?.city?.country?.id,
          city: instituteData?.region?.city?.id,
          region: instituteData?.region?.id,
          contact_person_name: instituteDataEn?.contactPersopnName,
          contact_person_position: instituteDataEn?.contactPersonPostion,
          translations: [
            {
              name: instituteDataAr?.name,
              address: instituteDataAr?.address,
              languageId: 1,
            },
            {
              name: instituteDataEn?.name,
              address: instituteDataEn?.address,
              languageId: 2,
            },
          ],
        }}
        validationSchema={instituteSchema}
        enableReinitialize
        onSubmit={(values, { resetForm }) => {
          const formData = buildFormData(values);
          mutate(
            {
              instituteId,
              formData,
            },
            {
              onSuccess: () => {
                resetForm();
              },
            },
          );
        }}
      >
        {({ values }) => (
          <Form>
            <CitiesHandler
              setCitiesOptions={setCitiesOptions}
              setRegionsOptions={setRegionsOptions}
            />
            <RegionsHandler setRegionsOptions={setRegionsOptions} />
            <div className="bg-white rounded-xl p-4">
              <div className="grid grid-cols-1 gap-4">
                <TextField
                  label={t("instituteNameArabic")}
                  name="translations[0].name"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <TextField
                  label={t("instituteAddressArabic")}
                  name="translations[0].address"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DropdownMenu
                  label={t("country")}
                  name="country"
                  options={countriesOptions}
                />
                <DropdownMenu
                  label={t("city")}
                  name="city"
                  options={citiesOptions}
                  disabled={!values.country}
                />
                <DropdownMenu
                  label={t("region")}
                  name="region"
                  options={regionsOptions}
                  disabled={!values.city}
                />
                <TextField
                  label={t("email")}
                  name="email"
                  type="email"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <div className="flex gap-3">
                  <div className="w-[120px]">
                    <DropdownMenu
                      label={t("phoneKey")}
                      name="phoneKey"
                      options={phoneKeys}
                    />
                  </div>
                  <div className="w-full">
                    <TextField
                      label={t("phone")}
                      name="phone"
                      moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                    />
                  </div>
                </div>
                <TextField
                  label={t("contactPerson")}
                  name="contact_person_name"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <TextField
                  label={t("contactPersonPosition")}
                  name="contact_person_position"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <div></div>
                <FileUploadField
                  label={t("logo")}
                  name="logo"
                  moreStyle="bg-[#F9F8F8]"
                  image={instituteData?.logo}
                />
                <FileUploadField
                  label={t("profileImage")}
                  name="image_profile"
                  moreStyle="bg-[#F4FBFF]"
                  image={instituteData?.image_profile}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 mt-4">
              <TextField
                label={t("instituteNameEnglish")}
                name="translations[1].name"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />
              <TextField
                label={t("instituteAddressEnglish")}
                name="translations[1].address"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />
            </div>
            <div className="text-end my-5">
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl"
              >
                {isPending ? <ButtonLoader /> : t("saveInstitute")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditInstituteDetails;
