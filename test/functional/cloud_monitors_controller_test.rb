require 'test_helper'

class CloudMonitorsControllerTest < ActionController::TestCase
  setup do
    @cloud_monitor = cloud_monitors(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:cloud_monitors)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create cloud_monitor" do
    assert_difference('CloudMonitor.count') do
      post :create, :cloud_monitor => @cloud_monitor.attributes
    end

    assert_redirected_to cloud_monitor_path(assigns(:cloud_monitor))
  end

  test "should show cloud_monitor" do
    get :show, :id => @cloud_monitor.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @cloud_monitor.to_param
    assert_response :success
  end

  test "should update cloud_monitor" do
    put :update, :id => @cloud_monitor.to_param, :cloud_monitor => @cloud_monitor.attributes
    assert_redirected_to cloud_monitor_path(assigns(:cloud_monitor))
  end

  test "should destroy cloud_monitor" do
    assert_difference('CloudMonitor.count', -1) do
      delete :destroy, :id => @cloud_monitor.to_param
    end

    assert_redirected_to cloud_monitors_path
  end
end
