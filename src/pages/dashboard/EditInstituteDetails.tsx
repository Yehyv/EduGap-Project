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
import { useEffect, useState, useMemo } from "react";
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
      setCitiesOptions(
        data.data.map((c) => ({
          label: c.name,
          value: c.id,
        })),
      );
    } else if (!values.country) {
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
      setRegionsOptions(
        data.data.map((r) => ({
          label: r.name,
          value: r.id,
        })),
      );
    } else if (!values.city) {
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

  /* ================= QUERIES ================= */
  const { data, isLoading } = useQuery({
    queryKey: ["getInstituteDataToUpdate", instituteId],
    queryFn: () => instituteDetails(instituteId),
  });

  const { data: countriesData } = useQuery({
    queryKey: ["getCountries"],
    queryFn: getCountriesDropdown,
  });

  const countriesOptions = useMemo(
    () =>
      countriesData?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      })) || [],
    [countriesData],
  );

  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editInstitute,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success") || "Success",
        text:
          t("instituteEditedSuccessfully") || "Institute edited successfully",
        confirmButtonColor: "#0d6efd",
      });
      queryClient.invalidateQueries({ queryKey: ["getInstituteDataToUpdate"] });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: t("error") || "Error",
        text:
          error?.response?.data?.message ||
          t("somethingWentWrong") ||
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
        countriesOptions?.find((c) => c.value === values.country)?.label || ""
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
    logo: Yup.mixed().required(t("logoRequired") || "Logo is required"),
    image_profile: Yup.mixed().required(
      t("profileImageRequired") || "Profile image is required",
    ),
    email: Yup.string()
      .email(t("invalidEmail") || "Invalid email")
      .required(t("emailRequired") || "Email is required"),
    phoneKey: Yup.string().required(
      t("phoneKeyRequired") || "Phone key is required",
    ),
    phone: Yup.string().required(t("phoneRequired") || "Phone is required"),
    country: Yup.string().required(
      t("countryRequired") || "Country is required",
    ),
    city: Yup.string().required(t("cityRequired") || "City is required"),
    region: Yup.string().required(t("regionRequired") || "Region is required"),
    contact_person_name: Yup.string().required(
      t("contactPersonRequired") || "Contact person is required",
    ),
    contact_person_position: Yup.string().required(
      t("contactPersonPositionRequired") ||
        "Contact person position is required",
    ),
    translations: Yup.array().of(
      Yup.object({
        name: Yup.string().required(t("nameRequired") || "Name is required"),
        address: Yup.string().required(
          t("addressRequired") || "Address is required",
        ),
      }),
    ),
  });

  /* ================= DATA COMPARISON ================= */
  const hasDataChanged = (currentValues, originalData) => {
    if (!originalData) return true;

    const originalDataAr = originalData.translations[0];
    const originalDataEn = originalData.translations[1];

    // Compare simple fields
    const simpleFieldsChanged =
      currentValues.email !== originalData.email ||
      currentValues.phoneKey !== originalData.phone_key ||
      currentValues.phone !== originalData.phone ||
      currentValues.country !== originalData.region?.city?.country?.id ||
      currentValues.city !== originalData.region?.city?.id ||
      currentValues.region !== originalData.region?.id ||
      currentValues.contact_person_name !==
        originalDataEn?.contactPersopnName ||
      currentValues.contact_person_position !==
        originalDataEn?.contactPersonPostion;

    // Compare translations
    const translationsChanged =
      currentValues.translations[0].name !== originalDataAr?.name ||
      currentValues.translations[0].address !== originalDataAr?.address ||
      currentValues.translations[1].name !== originalDataEn?.name ||
      currentValues.translations[1].address !== originalDataEn?.address;

    // Compare files (check if they are File objects, which means they've been changed)
    const filesChanged =
      currentValues.logo instanceof File ||
      currentValues.image_profile instanceof File;

    return simpleFieldsChanged || translationsChanged || filesChanged;
  };

  const instituteData = data?.data;
  const instituteDataAr = instituteData?.translations[0];
  const instituteDataEn = instituteData?.translations[1];

  if (isLoading) return <CircleLoader />;

  return (
    <>
      <DashboardPageTitle
        text={`${t("editInstitute") || "Edit Institute"} ${
          instituteDataEn?.name ?? ""
        }`}
      />
      <Formik
        initialValues={{
          logo: instituteData?.logo || "",
          image_profile: instituteData?.image_profile || "",
          email: instituteData?.email || "",
          phoneKey: instituteData?.phone_key || "",
          phone: instituteData?.phone || "",
          country: instituteData?.region?.city?.country?.id || "",
          city: instituteData?.region?.city?.id || "",
          region: instituteData?.region?.id || "",
          contact_person_name: instituteDataEn?.contactPersopnName || "",
          contact_person_position: instituteDataEn?.contactPersonPostion || "",
          translations: [
            {
              name: instituteDataAr?.name || "",
              address: instituteDataAr?.address || "",
              languageId: 1,
            },
            {
              name: instituteDataEn?.name || "",
              address: instituteDataEn?.address || "",
              languageId: 2,
            },
          ],
        }}
        validationSchema={instituteSchema}
        enableReinitialize
        onSubmit={(values, { resetForm }) => {
          // Check if data has changed
          if (!hasDataChanged(values, instituteData)) {
            Swal.fire({
              icon: "info",
              title: t("noChanges") || "No Changes",
              text:
                t("noDataChanged") ||
                "No data has been changed. Please make changes before saving.",
              confirmButtonColor: "#0d6efd",
            });
            return;
          }

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

            {/* English Section */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("englishInformation") || "English Information"}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <TextField
                  label={t("instituteNameEnglish")}
                  name="translations[1].name"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                />
                <TextField
                  label={t("instituteAddressEnglish")}
                  name="translations[1].address"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
                  as="textarea"
                />
              </div>
            </div>

            {/* Arabic Section */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("arabicInformation") || "Arabic Information"}
              </h3>
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
                  as="textarea"
                />
              </div>
            </div>

            {/* General Information */}
            <div className="bg-white rounded-xl p-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("generalInformation") || "General Information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="md:col-span-2"></div>
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

            {/* Submit Button */}
            <div className="text-end my-5">
              <button
                type="submit"
                disabled={isPending}
                className="bg-secondary hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
