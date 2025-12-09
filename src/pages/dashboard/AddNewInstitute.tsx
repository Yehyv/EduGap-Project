import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { TextField } from "@/shared/components";
import SelectField from "@/shared/components/forms/SelectField";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { phoneKeys } from "@/shared/utils/globals";
import { Formik, Form } from "formik";

const AddNewInstitute = () => {
  return (
    <>
      <DashboardPageTitle text="Add New Institute" />

      <Formik
        initialValues={{
          logo: "",
          image_profile: "",
          email: "",
          phone_key: "",
          phone: "",
          location: "",
          translations: [
            {
              name: "",
              address: "",
              languageId: 1, // Arabic
            },
            {
              name: "",
              address: "",
              languageId: 2, // English
            },
          ],
        }}
        onSubmit={(values) => {
          console.log("SUBMIT DATA:", values);
        }}
      >
        {({ values, handleChange }) => (
          <Form className="grid grid-cols-2 gap-4 bg-white rounded-xl p-4">
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Name (English):"
              name="translations[1].name"
              type="text"
            />
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Name (Arabic):"
              name="translations[0].name"
              type="text"
            />
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Address (English):"
              name="translations[1].address"
              type="text"
            />
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Address (Arabic):"
              name="translations[0].address"
              type="text"
            />
            <TextField
              label="Email:"
              name="email"
              type="email"
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
            />
            <div className="flex gap-3">
              <div className="w-[120px]">
                <DropdownMenu
                  label="Phone Key"
                  name="phoneKey"
                  options={phoneKeys}
                />
              </div>
              <div className="w-full">
                <TextField
                  moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                  label="Phone:"
                  name="phone"
                  type="text"
                />
              </div>
            </div>

            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Logo URL:"
              name="logo"
              type="text"
            />
            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Profile Image URL:"
              name="image_profile"
              type="text"
            />

            <TextField
              moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
              label="Location:"
              name="location"
              type="text"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AddNewInstitute;
