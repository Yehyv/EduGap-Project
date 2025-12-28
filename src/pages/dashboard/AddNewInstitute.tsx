import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { TextField } from "@/shared/components";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useLanguage } from "@/shared/localization/useLanguage";
import { phoneKeys } from "@/shared/utils/globals";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const AddNewInstitute = () => {
  const { t } = useLanguage();

  /* ================= VALIDATION ================= */
  const instituteSchema = Yup.object({
    logo: Yup.mixed().required(t("logoRequired")),

    image_profile: Yup.mixed().required(t("profileImageRequired")),

    email: Yup.string().email(t("invalidEmail")).required(t("emailRequired")),

    phoneKey: Yup.string().required(t("phoneKeyRequired")),
    phone: Yup.string().required(t("phoneRequired")),

    country: Yup.string().required(t("countryRequired")),
    city: Yup.string().required(t("cityRequired")),
    region: Yup.string().required(t("regionRequired")),

    contact_person_name: Yup.string().required(t("contactPersonNameRequired")),

    contact_person_position: Yup.string().required(
      t("contactPersonPositionRequired")
    ),

    translations: Yup.array()
      .min(2)
      .required()
      .of(
        Yup.object({
          name: Yup.string().required(t("nameRequired")),
          address: Yup.string().required(t("addressRequired")),
        })
      ),
  });
  return (
    <>
      <DashboardPageTitle text={t("addNewInstitute")} />

      <Formik
        initialValues={{
          logo: "",
          image_profile: "",
          email: "",
          phoneKey: "",
          phone: "",
          country: "",
          city: "",
          region: "",
          contact_person_name: "",
          contact_person_position: "",
          translations: [
            { name: "", address: "", languageId: 1 },
            { name: "", address: "", languageId: 2 },
          ],
        }}
        validationSchema={instituteSchema}
        onSubmit={(values) => {
          console.log("SUBMIT INSTITUTE DATA:", {
            ...values,
            translations: values.translations.map((t) => ({
              ...t,
            })),
          });
        }}
      >
        <Form>
          {/* ================= ARABIC ================= */}
          <div className="bg-white rounded-xl p-4">
            <div className="grid grid-cols-1 gap-4">
              <TextField
                label={t("instituteNameArabic")}
                name="translations[0].name"
                placeholder={t("instituteNameArabic")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />
              <TextField
                label={t("instituteAddressArabic")}
                name="translations[0].address"
                placeholder={t("instituteAddressArabic")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <DropdownMenu
                label={t("country")}
                name="country"
                options={phoneKeys}
              />
              <DropdownMenu label={t("city")} name="city" options={phoneKeys} />
              <DropdownMenu
                label={t("region")}
                name="region"
                options={phoneKeys}
              />
              <div></div>

              <TextField
                label={t("email")}
                name="email"
                type="email"
                placeholder={t("email")}
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
                    placeholder={t("phone")}
                    moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                  />
                </div>
              </div>

              <TextField
                label={t("contactPerson")}
                name="contact_person_name"
                placeholder={t("contactPerson")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />

              <TextField
                label={t("contactPersonPosition")}
                name="contact_person_position"
                placeholder={t("contactPersonPosition")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
              />

              <FileUploadField
                label={t("logo")}
                name="logo"
                placeholder={t("uploadPhoto")}
                moreStyle="bg-[#F9F8F8]"
              />

              <FileUploadField
                label={t("profileImage")}
                name="image_profile"
                placeholder={t("uploadPhoto")}
                moreStyle="bg-[#F4FBFF]"
              />
            </div>
          </div>

          {/* ================= ENGLISH ================= */}
          <div className="bg-white rounded-xl p-4 mt-4 grid grid-cols-1 gap-4">
            <TextField
              label={t("instituteNameEnglish")}
              name="translations[1].name"
              placeholder={t("instituteNameEnglish")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
            />
            <TextField
              label={t("instituteAddressEnglish")}
              name="translations[1].address"
              placeholder={t("instituteAddressEnglish")}
              moreStyle="!border-[#ACACAC] bg-[#F9F8F8] pb-12"
            />
          </div>

          <div className="text-end my-5">
            <button
              type="submit"
              className="bg-secondary cursor-pointer hover:bg-secondary-dark text-white px-12 py-1.5 rounded-xl"
            >
              {t("saveInstitute")}
            </button>
          </div>
        </Form>
      </Formik>
    </>
  );
};

export default AddNewInstitute;
